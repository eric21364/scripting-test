import { Button } from "scripting"

export function KeyView({
  title, action, wide = false
}: {
  title: string
  action: () => void
  wide?: boolean
}) {
  return <Button
    title={title}
    action={action}
    font={18}
    fontWeight={"medium"}
    padding={{
      vertical: 10
    }}
    frame={{
      minWidth: wide ? 80 : 34,
    }}
    background={"systemBackground"}
    foregroundStyle={"label"}
    clipShape={{
      type: 'rect',
      cornerRadius: 10
    }}
    shadow={{
      color: 'rgba(0,0,0,0.33)',
      radius: 1,
      y: 1,
    }}
  />
}