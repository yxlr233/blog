const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}
