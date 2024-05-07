const conn = require("../db/dbConnection");
const util = require("util");

const isStudent = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { token } = req.headers;

  try {
    const student = await query("select * from students where student_token = ?", [token]);

    if (student.length > 0) {
      next();
    } else {
      res.status(403).json({
        msg: "You are not authorized to access this route!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = isStudent;
