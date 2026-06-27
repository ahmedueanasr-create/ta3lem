class Session {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String roomName;
  final double price;
  final bool isPrivate;
  final bool recordingEnabled;
  final String? subjectName;
  final String? teacherName;
  final String? teacherAvatar;
  final int? enrollmentCount;
  final String? scheduledAt;
  final String? startedAt;
  final String? endedAt;
  final int durationMin;

  Session({
    required this.id,
    required this.title,
    this.description,
    this.status = 'scheduled',
    required this.roomName,
    this.price = 0,
    this.isPrivate = false,
    this.recordingEnabled = true,
    this.subjectName,
    this.teacherName,
    this.teacherAvatar,
    this.enrollmentCount,
    this.scheduledAt,
    this.startedAt,
    this.endedAt,
    this.durationMin = 60,
  });

  factory Session.fromJson(Map<String, dynamic> json) => Session(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'],
    status: json['status'] ?? 'scheduled',
    roomName: json['room_name'] ?? '',
    price: (json['price'] ?? 0).toDouble(),
    isPrivate: json['is_private'] ?? false,
    recordingEnabled: json['recording_enabled'] ?? true,
    subjectName: json['subject']?['name'],
    teacherName: json['teacher']?['user']?['name'],
    teacherAvatar: json['teacher']?['user']?['avatar'],
    enrollmentCount: json['enrollment_count'],
    scheduledAt: json['scheduled_at'],
    startedAt: json['started_at'],
    endedAt: json['ended_at'],
    durationMin: json['duration_min'] ?? 60,
  );

  bool get isLive => status == 'live';
  bool get isScheduled => status == 'scheduled';
  bool get isEnded => status == 'ended';
  bool get isCancelled => status == 'cancelled';

  String get statusLabel => switch (status) {
    'live' => 'مباشر',
    'scheduled' => 'مجدول',
    'ended' => 'منتهية',
    'cancelled' => 'ملغية',
    _ => status,
  };
}
