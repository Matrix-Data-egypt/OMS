import jwt from 'jsonwebtoken';
export function requireWritePermission(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'oms_media_jwt_secret_secure_key_2026_mde';
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            if (decoded.isReadOnly || decoded.username === 'manager' || decoded.username === 'مدير') {
                res.status(403).json({
                    success: false,
                    message: 'عفواً، حساب المدير بصلاحية المشاهدة والعرض فقط (View Only) وغير مصرح له بإضافة أو تعديل البيانات.',
                });
                return;
            }
        }
        catch {
            // ignore
        }
    }
    next();
}
