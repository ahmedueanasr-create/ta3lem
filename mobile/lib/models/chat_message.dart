class ChatMessage {
  final int userId;
  final String? userName;
  final String text;
  final int timestamp;

  ChatMessage({
    required this.userId,
    this.userName,
    required this.text,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    userId: json['userId'] ?? 0,
    userName: json['userName'],
    text: json['text'] ?? '',
    timestamp: json['ts'] ?? DateTime.now().millisecondsSinceEpoch,
  );
}
