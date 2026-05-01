import jwt from "jsonwebtoken";

const isAuthenticated = async (req,res,next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        if(!decodedToken){
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        };
        req.id= decodedToken.userId;
        next();
    } catch (error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
export default isAuthenticated;