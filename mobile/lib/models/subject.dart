class Subject {
  final int id;
  final String name;
  final String? description;
  final String? icon;
  final bool active;
  final int? teacherCount;
  final int? sessionCount;

  Subject({
    required this.id,
    required this.name,
    this.description,
    this.icon,
    this.active = true,
    this.teacherCount,
    this.sessionCount,
  });

  factory Subject.fromJson(Map<String, dynamic> json) => Subject(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    description: json['description'],
    icon: json['icon'],
    active: json['active'] ?? true,
    teacherCount: json['teacher_count'],
    sessionCount: json['session_count'],
  );
}

class Course {
  final int id;
  final String title;
  final String? description;
  final double price;
  final String? teacherName;
  final String? subjectName;
  final int? sessionCount;
  final int? studentCount;

  Course({
    required this.id,
    required this.title,
    this.description,
    this.price = 0,
    this.teacherName,
    this.subjectName,
    this.sessionCount,
    this.studentCount,
  });

  factory Course.fromJson(Map<String, dynamic> json) => Course(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'],
    price: (json['price'] ?? 0).toDouble(),
    teacherName: json['teacher']?['user']?['name'],
    subjectName: json['subject']?['name'],
    sessionCount: json['session_count'],
    studentCount: json['student_count'],
  );
}
