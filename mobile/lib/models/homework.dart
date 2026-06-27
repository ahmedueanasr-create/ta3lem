class Homework {
  final int id;
  final String title;
  final String? description;
  final String? fileUrl;
  final String? dueDate;
  final String? sessionTitle;
  final String? teacherName;
  final int? submissionCount;
  final String status;
  final bool submitted;
  final int? score;

  Homework({
    required this.id,
    required this.title,
    this.description,
    this.fileUrl,
    this.dueDate,
    this.sessionTitle,
    this.teacherName,
    this.submissionCount,
    this.status = 'active',
    this.submitted = false,
    this.score,
  });

  factory Homework.fromJson(Map<String, dynamic> json) => Homework(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'],
    fileUrl: json['file_url'],
    dueDate: json['due_date'],
    sessionTitle: json['session']?['title'],
    teacherName: json['teacher']?['user']?['name'],
    submissionCount: json['submission_count'],
    status: json['status'] ?? 'active',
    submitted: json['submitted'] ?? false,
    score: json['score'],
  );

  bool get isActive => status == 'active';
  bool get isGraded => score != null;
}
