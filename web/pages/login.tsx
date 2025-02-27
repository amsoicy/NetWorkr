import Header from "@/components/header"

export default function Login() {
  return (
    <main className="container m-auto">
      <Header />
      <title>Identity Tracker | Home</title>

      <div className="container">
        <div className="flex flex-row gap-3">
          <p>user</p>
          <input type="text" placeholder="username or email"
            className="input w-full max-w-xs rounded-none border-b-black" />
        </div>

        <div className="flex flex-row gap-3">
          <p>password</p>
          <input type="text" placeholder="password" className="input w-full max-w-xs rounded-none border-b-black" />
        </div>
      </div>
    </main>
  )
}
