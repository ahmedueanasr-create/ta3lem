class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String status;
  final bool mustChangePassword;
  final bool firstLogin;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.status = 'active',
    this.mustChangePassword = false,
    this.firstLogin = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] is String ? json['role'] : (json['role']?['name'] ?? ''),
      status: json['status'] ?? 'active',
      mustChangePassword: json['mustChangePassword'] ?? false,
      firstLogin: json['firstLogin'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'status': status,
      };

  bool get isStudent => role == 'student';
  bool get isTeacher => role == 'teacher';
  bool get isParent => role == 'parent';
  bool get isAdmin => role == 'super_admin' || role == 'platform_admin';
  bool get isSupervisor => role == 'teachers_supervisor' || role == 'student_supervisor';
}
