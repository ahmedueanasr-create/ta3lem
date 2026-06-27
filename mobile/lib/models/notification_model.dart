class AppNotification {
  final int id;
  final String title;
  final String? body;
  final String type;
  final bool read;
  final Map<String, dynamic>? data;
  final String createdAt;

  AppNotification({
    required this.id,
    required this.title,
    this.body,
    this.type = 'info',
    this.read = false,
    this.data,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    body: json['body'],
    type: json['type'] ?? 'info',
    read: json['read'] ?? false,
    data: json['data'],
    createdAt: json['created_at'] ?? '',
  );
}
