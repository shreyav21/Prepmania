import { clerkMiddleware,createRouteMatcher } from "@clerk/nextjs/server";



//protecting the route
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)', 
    '/forum(.*)'
])

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect()
  })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};