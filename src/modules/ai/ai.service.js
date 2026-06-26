const ai = require('./aiProvider');
const logger = require('../../config/logger');

const TUTOR_SYSTEM = `أنت مدرس خبير في المنصة التعليمية "تعليم". 
مهمتك: شرح الدروس، الإجابة على الأسئلة التعليمية، تلخيص المحتوى، واقتراح خطط دراسة.
تحدث باللغة العربية الفصحى البسيطة. قدم أمثلة عملية. اسأل الطالب لتقييم فهمه.
كن صبوراً ومشجعاً. للأسئلة خارج نطاق التعليم، قل بلطف "هذا خارج اختصاصي التعليمي".`;

const EXAM_SYSTEM = `أنت خبير في إنشاء الاختبارات التعليمية. 
أنشئ أسئلة وفق المواصفات المطلوبة بدقة. اخرج JSON فقط بالصيغة:
{
  "questions": [{ "type": "mcq"|"truefalse"|"essay", "question": "...", "options": ["أ","ب","ج","د"], "correctAnswer": 0, "explanation": "..." }]
}
لـ mcq: options مطلوب + correctAnswer (index). لـ truefalse: options غير مطلوب، correctAnswer 0/1. لـ essay: options و correctAnswer غير مطلوبين.`;

async function tutorChat(messages) {
  const reply = await ai.ask(TUTOR_SYSTEM, messages, { maxTokens: 4096 });
  return reply;
}

async function generateExam({ subject, level = 'متوسط', count = 5, types = ['mcq', 'truefalse'] }) {
  const prompt = `أنشئ ${count} أسئلة في مادة "${subject}" بمستوى ${level}.
أنواع الأسئلة المطلوبة: ${types.join(', ')}.
تأكد من تنوع الأسئلة ووضوحها ودقة الإجابات.`;
  const reply = await ai.ask(EXAM_SYSTEM, [prompt], { maxTokens: 8192, temperature: 0.8 });
  try {
    const cleaned = reply.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim();
    return JSON.parse(cleaned);
  } catch {
    logger.warn('AI exam parse failed, returning raw');
    return { questions: [], raw: reply };
  }
}

async function summarizeSession({ title, chatLog, duration }) {
  const prompt = `لخص الحصة التعليمية التالية:
العنوان: ${title}
المدة: ${duration || 'غير محدد'}
المحادثة: ${(chatLog || 'غير متوفرة').slice(0, 15000)}

المطلوب:
1. ملخص الحصة (3-5 نقاط)
2. أهم النقاط التعليمية
3. الواجب المطلوب من الطلاب
4. أسئلة مراجعة (3 أسئلة)`;
  return ai.ask(TUTOR_SYSTEM, [prompt], { maxTokens: 4096 });
}

module.exports = { tutorChat, generateExam, summarizeSession };
