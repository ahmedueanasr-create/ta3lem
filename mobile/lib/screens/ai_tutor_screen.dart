import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ai_provider.dart';
import '../theme/app_theme.dart';

class AiTutorScreen extends StatelessWidget {
  const AiTutorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
            child: const Icon(Icons.smart_toy, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 10),
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('المساعد الذكي', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('متصل', style: TextStyle(fontSize: 11, color: AppColors.success)),
          ]),
        ]),
      ),
      body: Consumer<AiProvider>(
        builder: (context, ai, _) => Column(
          children: [
            if (ai.messages.isEmpty) _buildQuickActions(context, ai),
            Expanded(
              child: ai.messages.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: ai.messages.length,
                      itemBuilder: (_, i) => _buildBubble(ai.messages[i], context),
                    ),
            ),
            if (ai.isLoading) const Padding(
              padding: EdgeInsets.all(8),
              child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)),
            ),
            _buildInput(context, ai),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, dynamic ai) {
    final actions = [
      {'icon': Icons.menu_book, 'label': 'اشرح درس', 'color': AppColors.primary, 'prompt': 'اشرح لي هذا الدرس بالتفصيل'},
      {'icon': Icons.quiz, 'label': 'حل سؤال', 'color': AppColors.secondary, 'prompt': 'ساعدني في حل هذا السؤال خطوة بخطوة'},
      {'icon': Icons.assignment, 'label': 'اختبرني', 'color': AppColors.success, 'prompt': 'اعمل اختبار سريع في المادة التي أدرسها'},
      {'icon': Icons.replay, 'label': 'راجع معي', 'color': AppColors.warning, 'prompt': 'راجع معي الدرس السابق'},
      {'icon': Icons.summarize, 'label': 'لخص', 'color': AppColors.danger, 'prompt': 'لخص لي هذا الموضوع بشكل مختصر'},
    ];
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ماذا تريد أن تفعل؟', style: AppTheme.subheading),
          const SizedBox(height: 12),
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: actions.length,
              itemBuilder: (_, i) {
                final a = actions[i];
                return GestureDetector(
                  onTap: () => ai.sendMessage(a['prompt'] as String),
                  child: Container(
                    width: 80,
                    margin: const EdgeInsets.only(left: 8),
                    decoration: BoxDecoration(
                      color: (a['color'] as Color).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(a['icon'] as IconData, size: 28, color: a['color'] as Color),
                        const SizedBox(height: 4),
                        Text(a['label'] as String, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: a['color'] as Color)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.08), shape: BoxShape.circle),
          child: const Icon(Icons.smart_toy, size: 64, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        const Text('اسألني عن أي شيء', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text('يمكنني شرح الدروس، حل الأسئلة،\nواختبار معلوماتك', textAlign: TextAlign.center, style: AppTheme.body),
      ]),
    );
  }

  Widget _buildBubble(dynamic msg, BuildContext context) {
    final isUser = msg.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: isUser ? const Radius.circular(4) : const Radius.circular(18),
            bottomRight: isUser ? const Radius.circular(18) : const Radius.circular(4),
          ),
          boxShadow: isUser ? null : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Text(
          msg.content,
          style: TextStyle(color: isUser ? Colors.white : null, fontSize: 15, height: 1.5),
        ),
      ),
    );
  }

  Widget _buildInput(BuildContext context, dynamic ai) {
    final ctrl = TextEditingController();
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SafeArea(
        top: false,
        child: Row(children: [
          Expanded(
            child: TextField(
              controller: ctrl,
              decoration: InputDecoration(
                hintText: 'اكتب سؤالك...',
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                filled: true,
                fillColor: AppColors.surfaceVariant,
              ),
              onSubmitted: (v) {
                if (v.trim().isNotEmpty) {
                  ai.sendMessage(v.trim());
                  ctrl.clear();
                }
              },
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white, size: 20),
              onPressed: () {
                if (ctrl.text.trim().isNotEmpty) {
                  ai.sendMessage(ctrl.text.trim());
                  ctrl.clear();
                }
              },
            ),
          ),
        ]),
      ),
    );
  }
}
