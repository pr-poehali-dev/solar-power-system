import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Icon from "@/components/ui/icon"

interface ApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLES = [
  "Финансовый советник",
  "Фонд",
  "Фэмили офис",
  "Предприниматель",
  "Частный инвестор",
]

export default function ApplicationForm({ open, onOpenChange }: ApplicationFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    comment: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("https://functions.poehali.dev/72fb25a3-7177-4b02-b042-99ce829982bc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Request failed")

      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Unknown error")

      toast({
        title: "Заявка отправлена",
        description: "Мы свяжемся с вами в ближайшее время.",
      })

      setForm({ name: "", email: "", phone: "", role: "", comment: "" })
      onOpenChange(false)
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте позже.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Оставить заявку</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Заполните форму и мы свяжемся с вами
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-300">
              Имя <span className="text-emerald-400">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300">
              Email <span className="text-emerald-400">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-neutral-300">
              Телефон
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-neutral-300">
              Роль <span className="text-emerald-400">*</span>
            </Label>
            <select
              id="role"
              name="role"
              required
              value={form.role}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-neutral-500">
                Выберите роль
              </option>
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-neutral-800 text-white">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-neutral-300">
              Комментарий
            </Label>
            <Textarea
              id="comment"
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Расскажите о ваших задачах..."
              rows={3}
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-400 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить заявку"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}