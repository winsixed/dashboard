export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-white">
      <form className="space-y-6 bg-[#1E1E1E] p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold">Вход</h1>
        <input type="text" placeholder="Логин" className="w-full p-2 bg-[#2A2A2A] text-white rounded" />
        <input type="password" placeholder="Пароль" className="w-full p-2 bg-[#2A2A2A] text-white rounded" />
        <button type="submit" className="w-full p-2 bg-accent text-black font-semibold rounded">Войти</button>
      </form>
    </div>
  )
}
