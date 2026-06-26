export default function WhatsAppFloat() {
  const number = '201000000000';
  const msg = encodeURIComponent('مرحباً، أريد الاستفسار عن منصة تعليم');
  return (
    <a
      href={`https://wa.me/${number}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
      aria-label="WhatsApp"
    >
      💬
    </a>
  );
}
