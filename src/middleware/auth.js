export function ensureAuth(req, res, next) {
  if (req.session?.user) return next();
  res.redirect('/login');
}
export function ensureGuest(req, res, next) {
  if (req.session?.user) return res.redirect('/dashboard');
  next();
}
