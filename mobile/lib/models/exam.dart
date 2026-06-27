class Exam {
  final int id;
  final String title;
  final String? description;
  final int durationMin;
  final int passScore;
  final String status;
  final String? courseName;
  final String? subjectName;
  final int? questionCount;
  final String? scheduledAt;
  final String? startsAt;
  final String? endsAt;

  Exam({
    required this.id,
    required this.title,
    this.description,
    this.durationMin = 30,
    this.passScore = 50,
    this.status = 'draft',
    this.courseName,
    this.subjectName,
    this.questionCount,
    this.scheduledAt,
    this.startsAt,
    this.endsAt,
  });

  factory Exam.fromJson(Map<String, dynamic> json) => Exam(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'],
    durationMin: json['duration_min'] ?? 30,
    passScore: json['pass_score'] ?? 50,
    status: json['status'] ?? 'draft',
    courseName: json['course']?['title'],
    subjectName: json['subject']?['name'],
    questionCount: json['question_count'],
    scheduledAt: json['scheduled_at'],
    startsAt: json['starts_at'],
    endsAt: json['ends_at'],
  );
}

class Question {
  final int id;
  final String questionText;
  final String type;
  final List<String> options;
  final int? correctIndex;
  final int points;

  Question({
    required this.id,
    required this.questionText,
    this.type = 'multiple_choice',
    this.options = const [],
    this.correctIndex,
    this.points = 1,
  });

  factory Question.fromJson(Map<String, dynamic> json) => Question(
    id: json['id'] ?? 0,
    questionText: json['question_text'] ?? '',
    type: json['type'] ?? 'multiple_choice',
    options: (json['options'] as List?)?.cast<String>() ?? [],
    correctIndex: json['correct_index'],
    points: json['points'] ?? 1,
  );
}

class ExamAttempt {
  final int id;
  final int examId;
  final int score;
  final int totalPoints;
  final String status;
  final String? startedAt;
  final String? endedAt;

  ExamAttempt({
    required this.id,
    required this.examId,
    this.score = 0,
    this.totalPoints = 0,
    this.status = 'in_progress',
    this.startedAt,
    this.endedAt,
  });

  factory ExamAttempt.fromJson(Map<String, dynamic> json) => ExamAttempt(
    id: json['id'] ?? 0,
    examId: json['exam_id'] ?? 0,
    score: json['score'] ?? 0,
    totalPoints: json['total_points'] ?? 0,
    status: json['status'] ?? 'in_progress',
    startedAt: json['started_at'],
    endedAt: json['ended_at'],
  );
}
