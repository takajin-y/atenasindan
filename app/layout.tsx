export const metadata = { title: "アテナちゃん診断 | studio ate" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system' }}>
        {children}
      </body>
    </html>
  );
}
