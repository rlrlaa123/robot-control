export function getBatteryLevel(
  battery: number,
): "normal" | "warning" | "critical" {
  if (battery < 10) return "critical"; // < 10
  if (battery <= 20) return "warning"; // 10 ~ 20
  return "normal"; // > 20
}
