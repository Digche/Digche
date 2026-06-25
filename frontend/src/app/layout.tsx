import "./globals.css"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="ltr">
      <body>
            <div className=" h-screen w-screen gap-15 overflow-x-hidden">

                {/* <div className=" h-full w-full max-w-lg bg-amber-600 mx-auto"> */}
                  {children}
                {/* </div> */}
            </div>

      </body>
    </html>
  )
}



