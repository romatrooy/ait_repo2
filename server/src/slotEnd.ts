/** Возвращает время конца «ЧЧ:ММ:СС» по времени начала «ЧЧ:ММ:СС» и длительности слота в минутах. */
export function slotEnd(startTime: string, durationMinutes: number): string {
  const [hours, minutes, seconds] = startTime.split(':').map(Number);
  const endMinutes = hours * 60 + minutes + durationMinutes;
  const two = (value: number): string => String(value).padStart(2, '0');
  return `${two(Math.floor(endMinutes / 60))}:${two(endMinutes % 60)}:${two(seconds)}`;
}
