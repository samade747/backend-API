import Users from '../models/Users.js'
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ALREADYEXISTS, BADREQUEST, CREATED, FORBIDDEN, INTERNALERROR, NOTFOUND, SUCCESS, UNAUTHORIZED, OK } from '../constants/httpStatus.js';
import nodemailer from 'nodemailer';
// import Users from '../models/register.js';






// @desc    SIGNUP
// @route   POST api/auth/signup
// @access  Public

export const signUp = async (req, res) => {
    console.log("signup controller")
    console.log(req.body, "===>>> req.body")

    try {
        const { firstName, lastName, userName, email, password, cPassword } =
            req.body;

        if (!firstName || !lastName || !userName || !email || !password || !cPassword) {
            return res
                .status(BADREQUEST) //BADREQUEST
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
            // .send("Missing Fields");
        }
        // const salt = genSaltSync(10);
        // const hashedPassword = hashSync(password, salt)
        // return res.send(hashedPassword)


        const user = await Users.findOne({ Email: email });

        console.log(user, "====>> user")
        if (user) {
            return res
                .status(ALREADYEXISTS)
                .send(sendError({ status: false, message: responseMessages.USER_EXISTS }));
        } else {

            const user = await Users.findOne({ UserName: userName });
            if (user) {
                return res
                    .status(ALREADYEXISTS)
                    .send(sendError({ status: false, message: responseMessages.USER_NAME_EXISTS }));
            } else {
                const salt = genSaltSync(10);
                let doc;

                if (password?.length > 7) {
                    doc = new Users({
                        FirstName: firstName,
                        LastName: lastName,
                        Email: email,
                        UserName: userName,
                        Password: hashSync(password, salt),
                    });
                    //otp
                    const otp = uuidv4().slice(0, 6);
                    console.log(otp, "==>> otp ban gaya")
                    doc.otp = otp
                    doc.expiresIn = Date.now() + 60000; // OTP expires in 10 minutes
                    let savedUser = await doc.save();
                    if (savedUser.errors) {
                        return res
                            .status(INTERNALERROR)
                            .send(sendError({ status: false, message: error.message, error }));
                    } else {
                        // return res.send(savedUser);
                        savedUser.Password = undefined;
                        const token = GenerateToken({ data: savedUser, expiresIn: '24h' });

                        // sendEmail()
                        const emailResponse = await sendEmailOTP(email, otp);

                        return res.status(CREATED).send(
                            sendSuccess({
                                status: true,
                                message: responseMessages.SUCCESS_REGISTRATION,
                                token,
                                data: savedUser,
                            })
                        );
                    }
                } else {
                    return res
                        .status(FORBIDDEN)
                        .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
                }
            }
        }
    } catch (error) {
        // console.log(error.message, "====>>>error")
        return res
            .status(500) //INTERNALERROR
            // .send(sendError({ status: false, message: error.message, error }));
            .send(error.message);
    }
};

