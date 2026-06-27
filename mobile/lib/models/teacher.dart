class TeacherProfile {
  final int id;
  final String name;
  final String? email;
  final String? phone;
  final String? bio;
  final String status;
  final double? rating;
  final int? studentCount;
  final int? sessionCount;
  final String? subjectName;
  final List<TeacherPricing>? pricing;

  TeacherProfile({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.bio,
    this.status = 'pending',
    this.rating,
    this.studentCount,
    this.sessionCount,
    this.subjectName,
    this.pricing,
  });

  factory TeacherProfile.fromJson(Map<String, dynamic> json) => TeacherProfile(
    id: json['user_id'] ?? json['id'] ?? 0,
    name: json['user']?['name'] ?? json['name'] ?? '',
    email: json['user']?['email'],
    phone: json['user']?['phone'],
    bio: json['bio'],
    status: json['status'] ?? 'pending',
    rating: (json['rating'] as num?)?.toDouble(),
    studentCount: json['student_count'],
    sessionCount: json['session_count'],
    subjectName: json['subject']?['name'],
    pricing: (json['pricing'] as List?)?.map((p) => TeacherPricing.fromJson(p)).toList(),
  );

  bool get isApproved => status == 'approved';
}

class TeacherPricing {
  final int id;
  final String type;
  final double price;
  final String? description;

  TeacherPricing({required this.id, required this.type, required this.price, this.description});

  factory TeacherPricing.fromJson(Map<String, dynamic> json) => TeacherPricing(
    id: json['id'] ?? 0,
    type: json['type'] ?? 'session',
    price: (json['price'] ?? 0).toDouble(),
    description: json['description'],
  );
}

class EarningsData {
  final double total;
  final double pending;
  final double withdrawn;
  final List<EarningItem>? recent;

  EarningsData({required this.total, this.pending = 0, this.withdrawn = 0, this.recent});

  factory EarningsData.fromJson(Map<String, dynamic> json) => EarningsData(
    total: (json['total'] ?? 0).toDouble(),
    pending: (json['pending'] ?? 0).toDouble(),
    withdrawn: (json['withdrawn'] ?? 0).toDouble(),
    recent: (json['recent'] as List?)?.map((e) => EarningItem.fromJson(e)).toList(),
  );
}

class EarningItem {
  final double amount;
  final String description;
  final String date;

  EarningItem({required this.amount, required this.description, required this.date});

  factory EarningItem.fromJson(Map<String, dynamic> json) => EarningItem(
    amount: (json['amount'] ?? 0).toDouble(),
    description: json['description'] ?? '',
    date: json['date'] ?? '',
  );
}
