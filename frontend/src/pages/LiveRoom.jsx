import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Room, Track, RoomEvent } from 'livekit-client';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(s => s[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

function isScreenShareSub(pub) {
  return pub.track && pub.source === Track.Source.ScreenShare && pub.isSubscribed;
}

function buildParticipantList(room, localUser) {
  if (!room) return [];
  const list = [];
  const lp = room.localParticipant;
  if (lp) {
    let hasVideo = false, hasAudio = false;
    lp.trackPublications.forEach(pub => {
      if (!pub.track) return;
      if (pub.track.kind === 'video' && pub.source !== Track.Source.ScreenShare) hasVideo = !pub.isMuted;
      if (pub.track.kind === 'audio') hasAudio = !pub.isMuted;
    });
    list.push({
      identity: lp.identity, name: lp.name || localUser?.name || 'أنا',
      isLocal: true, hasVideo, hasAudio, isScreenShare: false,
    });
    lp.trackPublications.forEach(pub => {
      if (isScreenShareSub(pub)) {
        list.push({
          identity: lp.identity + '::screen', name: (lp.name || localUser?.name || 'أنا') + ' - شاشة',
          isLocal: true, isScreenShare: true, hasVideo: true, hasAudio: false,
          participantIdentity: lp.identity,
        });
      }
    });
  }
  room.remoteParticipants.forEach(p => {
    let hasVideo = false, hasAudio = false;
    p.trackPublications.forEach(pub => {
      if (!pub.track) return;
      if (pub.track.kind === 'video' && pub.source !== Track.Source.ScreenShare) hasVideo = !pub.isMuted;
      if (pub.track.kind === 'audio') hasAudio = !pub.isMuted;
    });
    list.push({
      identity: p.identity, name: p.name || p.identity,
      isLocal: false, hasVideo, hasAudio, isScreenShare: false,
    });
    p.trackPublications.forEach(pub => {
      if (isScreenShareSub(pub)) {
        list.push({
          identity: p.identity + '::screen', name: (p.name || p.identity) + ' - شاشة',
          isLocal: false, isScreenShare: true, hasVideo: true, hasAudio: false,
          participantIdentity: p.identity,
        });
      }
    });
  });
  return list;
}

function ParticipantTile({ participant, roomRef, handRaised }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    const isScreen = participant.isScreenShare;
    const origId = isScreen ? participant.participantIdentity : participant.identity;
    const lkParticipant = participant.isLocal ? room.localParticipant : room.remoteParticipants.get(origId);
    if (!lkParticipant) return;

    function doAttach() {
      lkParticipant.trackPublications.forEach(pub => {
        if (!pub.track || !pub.isSubscribed) return;
        if (isScreen) {
          if (pub.source === Track.Source.ScreenShare) pub.track.attach(videoRef.current);
        } else {
          if (pub.source !== Track.Source.ScreenShare && pub.track.kind === 'video') pub.track.attach(videoRef.current);
          if (pub.track.kind === 'audio') pub.track.attach(audioRef.current);
        }
      });
    }

    function onSub(track, _pub, p) {
      if (p.identity !== origId) return;
      if (isScreen) {
        if (track.source === Track.Source.ScreenShare) track.attach(videoRef.current);
      } else {
        if (track.source !== Track.Source.ScreenShare && track.kind === 'video') track.attach(videoRef.current);
        if (track.kind === 'audio') track.attach(audioRef.current);
      }
    }

    function onUnsub(track, _pub, p) {
      if (p.identity !== origId) return;
      track.detach();
    }

    room.on(RoomEvent.TrackSubscribed, onSub);
    room.on(RoomEvent.TrackUnsubscribed, onUnsub);
    doAttach();

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSub);
      room.off(RoomEvent.TrackUnsubscribed, onUnsub);
    };
  }, [participant, roomRef]);

  const hasVideo = participant.isScreenShare || participant.hasVideo;

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800">
      <video ref={videoRef} autoPlay playsInline muted={participant.isLocal}
        className={'h-full w-full ' + (hasVideo ? 'object-cover' : 'hidden')} />
      <audio ref={audioRef} autoPlay playsInline muted={participant.isLocal} />

      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-xl font-bold text-white">
            {getInitials(participant.name)}
          </div>
        </div>
      )}

      {handRaised && (
        <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm shadow-lg">
          ✋
        </div>
      )}

      {participant.isScreenShare && (
        <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
          مشاركة الشاشة
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">
            {participant.name}
            {participant.isLocal && ' (أنا)'}
          </span>
          <span className="text-xs">{participant.hasAudio ? '🎤' : '🔇'}</span>
        </div>
      </div>
    </div>
  );
}

export default function LiveRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.name;
  const isTeacher = role === 'teacher' || role === 'platform_admin';
  const isAdmin = role === 'platform_admin' || role === 'super_admin';
  const isSupervisor = role === 'teachers_supervisor' || role === 'student_supervisor';
  const isObserver = isAdmin || isSupervisor;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [hands, setHands] = useState([]);
  const [err, setErr] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting');
  const [recording, setRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [roomLocked, setRoomLocked] = useState(false);
  const [roomName, setRoomName] = useState(null);

  const [reportForm, setReportForm] = useState({ show: false, type: 'other', description: '', severity: 'medium' });
  const [reports, setReports] = useState([]);

  const roomRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);
  const isTeacherRef = useRef(isTeacher);
  isTeacherRef.current = isTeacher;

  const screenShared = participants.some(p => p.isLocal && p.isScreenShare);

  function refreshParticipants() {
    setParticipants(buildParticipantList(roomRef.current, user));
  }

  useEffect(() => {
    let mounted = true;
    setConnectionState('connecting');

    const enter = async () => {
      try {
        let endpoint;
        if (isObserver) {
          endpoint = `/sessions/${id}/join-as-observer`;
        } else if (isTeacher) {
          endpoint = `/sessions/${id}/start`;
        } else {
          endpoint = `/sessions/${id}/join`;
        }
        const { data } = await api.post(endpoint);
        if (!mounted) return;
        setRoomName(data.data.roomName);

        const room = new Room();
        roomRef.current = room;

        room.on(RoomEvent.Connected, () => {
          if (!mounted) return;
          setConnectionState('connected');
          refreshParticipants();
        });
        room.on(RoomEvent.Disconnected, () => {
          if (!mounted) return;
          setConnectionState('disconnected');
        });
        room.on(RoomEvent.Reconnecting, () => {
          if (!mounted) return;
          setConnectionState('reconnecting');
        });
        room.on(RoomEvent.ParticipantConnected, () => {
          if (!mounted) return;
          refreshParticipants();
        });
        room.on(RoomEvent.ParticipantDisconnected, () => {
          if (!mounted) return;
          refreshParticipants();
        });
        room.on(RoomEvent.TrackSubscribed, () => {
          if (!mounted) return;
          refreshParticipants();
        });
        room.on(RoomEvent.TrackUnsubscribed, () => {
          if (!mounted) return;
          refreshParticipants();
        });
        room.on(RoomEvent.TrackMuted, () => {
          if (!mounted) return;
          refreshParticipants();
        });
        room.on(RoomEvent.TrackUnmuted, () => {
          if (!mounted) return;
          refreshParticipants();
        });

        await room.connect(data.data.livekitUrl || import.meta.env.VITE_LIVEKIT_URL || 'ws://127.0.0.1:7880', data.data.token);

        const sock = connectSocket();
        socketRef.current = sock;
        sock.emit('session:join', { sessionId: id });

        sock.on('chat:message', (m) => {
          if (!mounted) return;
          setMessages(prev => [...prev, {
            userId: m.userId, userName: m.userName || '#' + m.userId,
            text: m.text, ts: m.ts || Date.now(),
          }]);
        });

        sock.on('hand:raised', (m) => {
          if (!mounted) return;
          setHands(prev => prev.includes(m.userId) ? prev : [...prev, m.userId]);
        });

        sock.on('hand:lowered', (m) => {
          if (!mounted) return;
          setHands(prev => prev.filter(u => u !== m.userId));
        });

        sock.on('session:ended', () => {
          if (!mounted) return;
          navigate('/dashboard');
        });

        sock.on('room:locked', (m) => {
          if (!mounted) return;
          setRoomLocked(m.locked || false);
        });

        sock.on('mute:user', (m) => {
          if (!mounted || !roomRef.current) return;
          if (m.userId === user.id) return;
          const rp = roomRef.current.remoteParticipants;
          rp.forEach(p => {
            if (p.identity === m.userId || p.identity === 'student-' + m.userId) {
              p.audioTrackPublications.forEach(pub => {
                if (pub.track) pub.track.mute();
              });
            }
          });
        });

        sock.on('kick:user', (m) => {
          if (!mounted) return;
          if (m.userId === user.id) {
            navigate('/dashboard');
          }
        });

        sock.on('session:report', (m) => {
          if (!mounted) return;
          setReports(prev => [...prev, m]);
        });

      } catch (ex) {
        if (!mounted) return;
        setErr(ex.response?.data?.message || ex.message);
        setConnectionState('disconnected');
      }
    };

    enter();

    return () => {
      mounted = false;
      roomRef.current?.disconnect();
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const send = useCallback((e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('chat:message', { sessionId: id, text });
    setMessages(p => [...p, {
      userId: user.id, userName: user.name || '#' + user.id,
      text, ts: Date.now(),
    }]);
    setText('');
  }, [text, id, user]);

  const raiseHand = useCallback(() => {
    socketRef.current?.emit('hand:raise', { sessionId: id });
  }, [id]);

  const lowerHand = useCallback(() => {
    socketRef.current?.emit('hand:lower', { sessionId: id });
  }, [id]);

  const lowerStudentHand = useCallback((userId) => {
    socketRef.current?.emit('hand:lower', { sessionId: id, targetUserId: userId });
    setHands(prev => prev.filter(u => u !== userId));
  }, [id]);

  const leave = useCallback(async () => {
    if (isTeacherRef.current && !isObserver) await api.post(`/sessions/${id}/end`).catch(() => {});
    navigate('/dashboard');
  }, [id, navigate]);

  const toggleFullscreen = useCallback(() => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room?.localParticipant) return;
    try {
      await room.localParticipant.setScreenShareEnabled(!screenShared);
    } catch (e) {
      console.error('Screen share error:', e);
    }
  }, [screenShared]);

  const toggleRecording = useCallback(async () => {
    try {
      if (recording) {
        await api.post(`/sessions/${id}/recording/stop`);
        setRecording(false);
      } else {
        await api.post(`/sessions/${id}/recording/start`);
        setRecording(true);
      }
    } catch (e) {
      console.error('Recording error:', e);
    }
  }, [id, recording]);

  const muteAll = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    room.remoteParticipants.forEach(p => {
      p.audioTrackPublications.forEach(pub => {
        if (pub.track) pub.track.mute();
      });
    });
  }, []);

  const muteUser = useCallback((targetIdentity) => {
    const room = roomRef.current;
    if (!room) return;
    room.remoteParticipants.forEach(p => {
      if (p.identity === targetIdentity) {
        p.audioTrackPublications.forEach(pub => {
          if (pub.track) pub.track.mute();
        });
      }
    });
    socketRef.current?.emit('mute:user', { sessionId: id, targetUserId: targetIdentity });
  }, [id]);

  const kickUser = useCallback((targetIdentity) => {
    if (!confirm('تأكيد طرد المشارك؟')) return;
    socketRef.current?.emit('kick:user', { sessionId: id, targetUserId: targetIdentity });
  }, [id]);

  const endSession = useCallback(async () => {
    try {
      await api.post(`/sessions/${id}/end`);
    } catch {}
    navigate('/dashboard');
  }, [id, navigate]);

  const forceEndSession = useCallback(async () => {
    if (!confirm('إنهاء الجلسة forcefully؟')) return;
    try {
      await api.post(`/sessions/${id}/force-end`);
      socketRef.current?.emit('session:force-end', { sessionId: id });
    } catch {}
    navigate('/dashboard');
  }, [id, navigate]);

  const suspendTeacher = useCallback(async () => {
    if (!confirm('تعليق حساب المدرس وإنهاء الجلسة؟')) return;
    try {
      await api.post(`/sessions/${id}/suspend-teacher`);
      socketRef.current?.emit('session:force-end', { sessionId: id });
    } catch {}
    navigate('/dashboard');
  }, [id, navigate]);

  const toggleLock = useCallback(async () => {
    try {
      const newLocked = !roomLocked;
      await api.post(`/sessions/${id}/lock`, { locked: newLocked });
      setRoomLocked(newLocked);
    } catch (e) {
      console.error('Lock error:', e);
    }
  }, [id, roomLocked]);

  const submitReport = useCallback((e) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;
    socketRef.current?.emit('session:report', {
      sessionId: id,
      type: reportForm.type,
      description: reportForm.description,
      severity: reportForm.severity,
    });
    api.post(`/sessions/${id}/report`, {
      type: reportForm.type,
      description: reportForm.description,
      severity: reportForm.severity,
    }).catch(() => {});
    setReportForm({ show: false, type: 'other', description: '', severity: 'medium' });
  }, [id, reportForm]);

  const handUp = hands.includes(user?.id);

  const gridClass = participants.length <= 1
    ? 'grid-cols-1'
    : participants.length <= 2
    ? 'grid-cols-2'
    : participants.length <= 4
    ? 'grid-cols-2'
    : participants.length <= 6
    ? 'grid-cols-3'
    : 'grid-cols-4';

  const statusConfig = {
    connected: { dot: 'bg-green-500', label: 'متصل' },
    reconnecting: { dot: 'bg-amber-500', label: 'إعادة الاتصال...' },
    connecting: { dot: 'bg-amber-500', label: 'جاري الاتصال...' },
    disconnected: { dot: 'bg-red-500', label: 'غير متصل' },
  };
  const status = statusConfig[connectionState] || statusConfig.disconnected;

  if (err) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-red-600">{err}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
        >
          رجوع
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm">
            <span className={'inline-block h-2.5 w-2.5 rounded-full ' + status.dot} />
            {status.label}
          </span>
          {connectionState === 'reconnecting' && (
            <span className="text-xs text-amber-400">جاري محاولة إعادة الاتصال...</span>
          )}
          {roomName && <span className="text-sm text-slate-400">{roomName}</span>}
          {isObserver && (
            <span className="rounded bg-purple-700 px-2 py-0.5 text-xs text-white">مُراقِب</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isObserver && isTeacher && (
            <>
              <button
                onClick={toggleLock}
                className={'rounded-lg px-3 py-1.5 text-xs ' + (roomLocked ? 'bg-amber-600' : 'bg-slate-700') + ' hover:opacity-80'}
              >
                {roomLocked ? '🔒 مقفول' : '🔓 فتح الغرفة'}
              </button>
              <button
                onClick={endSession}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs hover:bg-red-700"
              >
                إنهاء الجلسة للجميع
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button
                onClick={forceEndSession}
                className="rounded-lg bg-red-700 px-3 py-1.5 text-xs hover:bg-red-800"
              >
                ⛔ إنهاء قسري
              </button>
              <button
                onClick={suspendTeacher}
                className="rounded-lg bg-orange-700 px-3 py-1.5 text-xs hover:bg-orange-800"
              >
                🚫 تعليق المدرس
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report form modal */}
      {reportForm.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <form onSubmit={submitReport} className="mx-4 w-full max-w-md rounded-xl bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-bold">تقديم بلاغ</h3>
            <select
              value={reportForm.type}
              onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
            >
              <option value="conduct">سلوك</option>
              <option value="technical">تقني</option>
              <option value="content">محتوى</option>
              <option value="other">أخرى</option>
            </select>
            <select
              value={reportForm.severity}
              onChange={e => setReportForm(f => ({ ...f, severity: e.target.value }))}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
            >
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="high">عالي</option>
              <option value="critical">حرج</option>
            </select>
            <textarea
              value={reportForm.description}
              onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
              placeholder="وصف البلاغ..."
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={4}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700">
                إرسال البلاغ
              </button>
              <button
                type="button"
                onClick={() => setReportForm(f => ({ ...f, show: false }))}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm hover:bg-slate-500"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div ref={videoContainerRef} className="flex flex-1 flex-col">
          <div className={'grid flex-1 gap-2 p-2 content-center ' + gridClass}>
            {participants.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-slate-500">
                في انتظار المشاركين...
              </div>
            )}
            {participants.map(p => (
              <ParticipantTile
                key={p.identity}
                participant={p}
                roomRef={roomRef}
                handRaised={!p.isLocal && p.isScreenShare ? false : hands.includes(p.identity)}
              />
            ))}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-center gap-3 border-t border-slate-800 bg-slate-900 p-3">
            {!isObserver && (
              <button
                onClick={handUp ? lowerHand : raiseHand}
                className={'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ' + (handUp ? 'bg-amber-600' : 'bg-slate-700') + ' hover:opacity-80'}
              >
                ✋ {handUp ? 'خفض اليد' : 'رفع اليد'}
              </button>
            )}

            {!isObserver && (
              <button
                onClick={toggleScreenShare}
                className={'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ' + (screenShared ? 'bg-brand-600' : 'bg-slate-700') + ' hover:opacity-80'}
              >
                📺 {screenShared ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}
              </button>
            )}

            {!isObserver && isTeacher && (
              <button
                onClick={toggleRecording}
                className={'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ' + (recording ? 'bg-red-600 animate-pulse' : 'bg-slate-700') + ' hover:opacity-80'}
              >
                {recording ? '⏹ إيقاف التسجيل' : '⏺ بدء التسجيل'}
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            >
              ⛶ ملء الشاشة
            </button>

            <button
              onClick={() => setReportForm(f => ({ ...f, show: true }))}
              className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-red-600"
            >
              📋 بلاغ
            </button>

            <button
              onClick={leave}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex w-80 flex-shrink-0 flex-col border-l border-slate-800 bg-slate-900">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={'flex-1 px-4 py-3 text-sm font-medium ' + (activeTab === 'chat' ? 'border-b-2 border-brand-500 text-brand-400' : 'text-slate-400 hover:text-white')}
            >
              💬 دردشة
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={'flex-1 px-4 py-3 text-sm font-medium ' + (activeTab === 'participants' ? 'border-b-2 border-brand-500 text-brand-400' : 'text-slate-400 hover:text-white')}
            >
              👥 مشاركون{hands.length > 0 ? ' (' + hands.length + ')' : ''}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={'flex-1 px-4 py-3 text-sm font-medium ' + (activeTab === 'reports' ? 'border-b-2 border-red-500 text-red-400' : 'text-slate-400 hover:text-white')}
            >
              📋 بلاغات
            </button>
          </div>

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
                {messages.length === 0 && (
                  <p className="text-center text-slate-500">لا توجد رسائل بعد</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className="rounded-lg bg-slate-800/50 p-2">
                    <p className="text-xs font-medium text-brand-400">{m.userName}</p>
                    <p className="mt-0.5 break-words text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-slate-800 p-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button className="rounded-lg bg-brand-600 px-3 text-sm text-white hover:bg-brand-700">
                  إرسال
                </button>
              </form>
            </>
          )}

          {/* Participants tab */}
          {activeTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-3">
              {participants.filter(p => !p.isScreenShare).map(p => (
                <div key={p.identity} className="mb-2 flex items-center justify-between rounded-lg bg-slate-800/50 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                      {getInitials(p.name)}
                    </div>
                    <div>
                      <p className="text-sm">{p.name}</p>
                      {p.isLocal && <span className="text-xs text-slate-400">(أنا)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {hands.includes(p.identity) && <span className="text-amber-400">✋</span>}
                    <span>{p.hasAudio ? '🎤' : '🔇'}</span>
                    <span>{p.hasVideo ? '📹' : '🚫'}</span>
                    {!p.isLocal && isTeacher && !isObserver && (
                      <>
                        <button
                          onClick={() => muteUser(p.identity)}
                          className="rounded bg-slate-700 px-1.5 py-0.5 text-xs hover:bg-amber-600"
                          title="كتم"
                        >
                          🔇
                        </button>
                        <button
                          onClick={() => kickUser(p.identity)}
                          className="rounded bg-slate-700 px-1.5 py-0.5 text-xs hover:bg-red-600"
                          title="طرد"
                        >
                          🚫
                        </button>
                      </>
                    )}
                    {!p.isLocal && hands.includes(p.identity) && isTeacher && (
                      <button
                        onClick={() => lowerStudentHand(p.identity)}
                        className="rounded bg-amber-700 px-1.5 py-0.5 text-xs hover:bg-amber-600"
                        title="خفض اليد"
                      >
                        ✋↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {participants.filter(p => !p.isScreenShare).length === 0 && (
                <p className="text-center text-sm text-slate-500">لا يوجد مشاركون</p>
              )}

              {isTeacher && !isObserver && (
                <button
                  onClick={muteAll}
                  className="mt-3 w-full rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
                >
                  🔇 كتم الكل
                </button>
              )}
            </div>
          )}

          {/* Reports tab */}
          {activeTab === 'reports' && (
            <div className="flex-1 overflow-y-auto p-3">
              <button
                onClick={() => setReportForm(f => ({ ...f, show: true }))}
                className="mb-3 w-full rounded-lg bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
              >
                📋 تقديم بلاغ
              </button>
              {(isAdmin || isSupervisor) && reports.length > 0 && (
                <div className="space-y-2">
                  {reports.map((r, i) => (
                    <div key={i} className="rounded-lg bg-slate-800/50 p-2 text-xs">
                      <p className="text-red-400">{r.type} - {r.severity}</p>
                      <p className="mt-1 text-slate-300">{r.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {reports.length === 0 && (
                <p className="text-center text-sm text-slate-500">لا توجد بلاغات</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
