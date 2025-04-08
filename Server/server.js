const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const fs = require('fs');
const app = express();
const speakeasy = require('speakeasy');
const { cloneElement } = require("react");
app.use(express.json({ limit: '10mb' })); // or higher
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });
const PORT = 5000;
const uri = "mongodb://127.0.0.1:27017";
const JWT_SECRET = "RENCODER2025";

const client = new MongoClient(uri);
const db = client.db("Rencoder");
const stud = db.collection("Student");

// Generate a secret key (store this securely)


app.use('/uploads', express.static('uploads'));

app.post("/login", async (req, res) => {
    try {
        console.log("Enter Db");
        
        await client.connect();
        const { studEmail, password} = req.body;


        const user = await stud.findOne({ studEmail });
        if (!user) {
            console.log("User not found");
            
            return res.status(400).json({ message: "User not found" });}

        if (user.studStatus !== "active") {
            console.log("Not active");
            
            return res.status(403).json({ message: "Account is not active" });
        }

        if (password !== user.studPassword) {
            console.log("Wrong Passowrd");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.studEmail },
            JWT_SECRET,
            { expiresIn: "168h" }
        );

        res.json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }finally{
        await client.close()
    }
});


app.post("/subjects", async (req, res) => {
    console.log("Enter the API");

    try {
        await client.connect();
        const { studEmail } = req.body;
        const student = await stud.findOne({ studEmail });
        return res.status(200).json({ courses: student.courses });
    } 
    catch (error) {
        console.error("Error fetching courses:", error.response?.data || error.message, error);
console.error("Error inserting attendance:", error.response?.data || error.message, error);
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
        

    } 
    finally {
        await client.close();
    }
});

app.post("/attendance", async (req, res) => {
    try {
      await client.connect();
      console.log("Enter the attendance API");
  
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
  
      const studentEmail = decoded.email;
      const { image, subjectName, stackName } = req.body;
  
      if (!subjectName || !stackName || !image) {
        return res.status(400).json({ error: "Subject, stack, and image are required" });
      }
  
      // Make sure folder exists
      const folderPath = path.join(__dirname, "attendance_images");
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
  
      const imageBuffer = Buffer.from(image, 'base64');
      const filename = `${subjectName}_${stackName}_${Date.now()}.jpg`;
      const filepath = path.join(folderPath, filename);
      fs.writeFileSync(filepath, imageBuffer);
  
      const newAttendance = {
        date: new Date().toISOString().split("T")[0],
        stack: stackName,
        subject: subjectName,
        status: "Present",
        imagePath: filepath,
      };
  
console.log(newAttendance);
const updatedStudent = await stud.updateOne(
    {
      studEmail: studentEmail,
      "courses.stack": stackName,
      "courses.subjects.subject": subjectName
    },
    {
      $push: {
        "courses.$[course].subjects.$[subject].attendance": newAttendance
      }
    },
    {
      arrayFilters: [
        { "course.stack": stackName },
        { "subject.subject": subjectName }
      ]
    }
  );
  
  
      console.log(updatedStudent);
      
      const updateCourseAttendance = await stud.updateOne(
        { email: studentEmail, "courses.stack": stackName },
        {
          $inc: { "courses.$[course].subjects.$[subject].attendanceCount": 1 }
        },
        {
          arrayFilters: [
            { "course.stack": stackName },
            { "subject.subject": subjectName }
          ]
        }
      );
  
      console.log("Attendance inserted:", updatedStudent.modifiedCount);
      res.status(200).json({ message: "Attendance marked successfully" });
  
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      await client.close();
    }
  });


 
  app.post("/getAttendance", async (req, res) => {
    try {
      const { studEmail } = req.body;
  
      console.log("Fetching attendance records...");
  
      try{
        
        
        await client.connect();
        
        console.log("Entered The try block");
      }

      catch(error){
        console.log("enter the catch block");
        console.log("Error",error);
      }

      const student = await stud.findOne({ studEmail });
      if (!student) return res.status(404).json({ error: "Student not found" });
  
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
  
      const absentRecords = [];
  
      for (const course of student.courses || []) {
        for (const subject of course.subjects || []) {
          const subjectAttendance = Array.isArray(subject.attendance) ? subject.attendance : [];
  
          const markedYesterday = subjectAttendance.some(att => att.date === yesterdayStr);
  
          if (!markedYesterday && subject.status === "In Progress") {
            absentRecords.push({
              courseIndex: student.courses.indexOf(course),
              subjectIndex: course.subjects.indexOf(subject),
              absentRecord: {
                date: yesterdayStr,
                stack: course.stack,
                subject: subject.subject,
                status: "Absent",
                imagePath: null
              }
            });
          }
        }
      }
  
      for (const rec of absentRecords) {
        const { courseIndex, subjectIndex, absentRecord } = rec;
        const attendancePath = `courses.${courseIndex}.subjects.${subjectIndex}.attendance`;
  
        // Sanitize: Ensure target path is an array
        const doc = await stud.findOne({ studEmail });
        const currentVal = (((doc.courses || [])[courseIndex] || {}).subjects || [])[subjectIndex]?.attendance;
  
        if (!Array.isArray(currentVal)) {
          await stud.updateOne(
            { studEmail },
            { $set: { [attendancePath]: [] } }
          );
        }
  
        await stud.updateOne(
          { studEmail },
          { $push: { [attendancePath]: absentRecord } }
        );
      }
  
      const updatedStudent = await stud.findOne({ studEmail });
      const todayAttendance = [];
  
      for (const course of updatedStudent.courses || []) {
        for (const subject of course.subjects || []) {
          const subjectAttendance = Array.isArray(subject.attendance) ? subject.attendance : [];
          for (const att of subjectAttendance) {
            if (att.date === today) {
              todayAttendance.push(att);
            }
          }
        }
      }
  
      console.log("Today's Attendance:", todayAttendance);
      res.status(200).json({ attendance: todayAttendance });
  
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      await client.close();
    }
  });
  
  
  

app.post("/courseDetails", async (req, res) => {
    try {
        console.log("Enter the Course Details API");
        
        await client.connect();
        

        const { studEmail } = req.body; 
        console.log(studEmail);
        
        if (!studEmail) {
            return res.status(400).json({ message: "Student email is required" });
        }

        const student = await stud.findOne(
            { studEmail: studEmail }, 
            { projection: { courses: 1, _id: 0 } }
        );
        console.log(student);
        

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student.courses);
    } catch (error) {
        console.error("Error fetching course details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await client.close();
    }
});


app.post('/updateProfile', upload.single('profileImage'), async (req, res) => {
    try {
       
        
        await client.connect();

        const studEmail = req.body.studEmail;
        const studAddress = req.body.studAddress;  
        const degree = req.body.degree;
        const studDOB = req.body.studDOB; 
        const studOccupation = req.body.studOccupation;
        const studDesignation = req.body.studDesignation;         
        const imagePath = req.file ? `uploads/${req.file.filename}` : null;

        console.log('Received data:', req.body);
        console.log('Received file:', req.file);

        console.log("Received studAddress:", studAddress);
        console.log("Received studDOB:", studDOB);
        console.log("Received Degree:", degree);

        if (!studEmail) {
            return res.status(400).json({ error: "Email is required" });
        }

        const updateFields = {};
        if (studAddress) updateFields.studAddress = studAddress;
        if (degree) updateFields.degree = degree;
        if (studDOB) updateFields.studDOB = studDOB;
        if (imagePath) updateFields.studPic = imagePath;
        if( studOccupation) updateFields.studOccupation = studOccupation;
        if( studDesignation) updateFields.studDesignation = studDesignation;

        const result = await stud.updateOne(
            { studEmail },
            { $set: updateFields }
        );
        console.log('Update result:', result);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Profile not found or no changes made" });
        }

        res.json({ message: "Profile updated successfully", imagePath });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

app.get('/getProfile', async (req, res) => {
    try {
    
        const { studEmail } = req.query;

        if (!studEmail) {
            return res.status(400).json({ error: "Email is required" });
        }
        await client.connect();
        const result = await stud.findOne({ studEmail });

        if (!result) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ profile: result });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

app.get('/getCourse', async (req, res) => {
    try {
        await client.connect();
        console.log("Enter the GetCourse");

        const { studEmail } = req.query;

        if (!studEmail) {
            return res.status(400).json({ message: "studEmail is required" });
        }


        const courses = await stud.find(
            { studEmail: studEmail },
            { projection: {courses:1,_id: 0 } }
        ).toArray();

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this email" });
        }

        console.log(courses);
        
        console.log("Exit");
        res.json(courses);

    } catch (error) {
        console.log("Error fetching courses:", error);
        res.status(500).json({ message: "Error fetching courses", error });
    } finally {
        await client.close();
    }
});




app.post('/generateOtp', async (req, res) => {
    try {
        await client.connect();
        const { studEmail } = req.body;

        // Check if the user exists
        const user = await stud.findOne({ studEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Generate a base32 secret using speakeasy
        const secret = speakeasy.generateSecret({ length: 20 }).base32;
        
        // Generate a 6-digit OTP
        const otp = speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            digits: 6,
        });

        console.log("Generated OTP:", otp);

        // Save OTP and secret to the database with a timestamp
        await stud.updateOne({ studEmail }, { $set: { otp, otpSecret: secret, otpExpires: Date.now() + 5 * 60 * 1000 } });

        return res.status(200).json({ message: 'OTP generated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally{
        await client.close();
    }
});

app.post('/verifyOtp', async (req, res) => {
    try {
        await client.connect();
        const { email, otp } = req.body;

        // Find the user and check if OTP exists
        const user = await stud.findOne({ studEmail: email });
        if (!user || !user.otp || !user.otpSecret) {
            return res.status(400).json({ message: 'Invalid email or OTP not generated' });
        }

        // Check if OTP has expired
        if (Date.now() > user.otpExpires) {
            return res.status(401).json({ message: 'OTP has expired' });
        }

        // Verify OTP using speakeasy
        const isValidOtp = speakeasy.totp.verify({
            secret: user.otpSecret,
            encoding: 'base32',
            token: otp,
            window: 1,
        });

        if (!isValidOtp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.studEmail }, JWT_SECRET, { expiresIn: '7d' });

        // OTP verified - clear OTP from the database
        await stud.updateOne({ studEmail: email }, { $unset: { otp: "", otpSecret: "", otpExpires: "" } });

        // Send the response only once
        return res.status(200).json({ message: 'OTP verified successfully', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally{
        await client.close();
    }
});

app.post("/payment", async (req, res) => {
    try {
        await client.connect();
        console.log("Entered the payment API");

        const { studEmail, stack, amountPaid, paymentType } = req.body;
        console.log("Received data:", req.body);

        // Fetch the student document to get the current dueAmount
        const student = await stud.findOne({ studEmail });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Find the course with the given stack
        const course = student.courses.find(course => course.stack === stack);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        let dueAmount = course.payment.dueAmount || course.payment.coursePrice; // Default to full price if dueAmount not set
        dueAmount -= amountPaid; // Calculate new due amount

        let updateData = {
            "courses.$.payment.paymentType": paymentType,
            "courses.$.payment.paymentStatus": dueAmount === 0 ? "Paid" : "Partially Paid",
            "courses.$.payment.dueAmount": dueAmount
        };

        // Update the payment details
        const result = await stud.updateOne(
            {
                "studEmail": studEmail,
                "courses.stack": stack
            },
            {
                $set: updateData,
                $push: {
                    "courses.$.payment.paymentHistory": { amountPaid, date: new Date().toISOString().split("T")[0] }
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log("Payment updated successfully");
            res.status(200).json({ message: "Payment updated successfully" });
        } else {
            console.log("Payment update failed");
            res.status(400).json({ message: "Payment update failed" });
        }
    } catch (error) {
        console.log("Error in payment API", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

app.get("/history", async (req, res) => {
    try {
        await client.connect();
        console.log("Enter the history");

        const { studEmail } = req.query;

        if (!studEmail) {
            return res.status(400).json({ message: "studEmail is required" });
        }

        const result = await stud.findOne(
            { studEmail: studEmail },
            { projection: { courses: 1, _id: 0 } }
        );

        if (!result || !result.courses || result.courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this email" });
        }

        // Extract required fields from each course
        const formattedCourses = result.courses.map((course) => ({
            stack: course.stack,
            courseID: course.courseID,
            startDate: course.startDate,
            coursePrice: course.payment?.coursePrice || 0,
            paymentType: course.payment?.paymentType || "N/A",
            dueAmount: course.payment?.dueAmount || 0,
            paymentStatus: course.payment?.paymentStatus || "Unknown",
            paymentHistory: Array.isArray(course.payment?.paymentHistory) 
                ? course.payment.paymentHistory 
                : Object.values(course.payment?.paymentHistory || {}),
        }));

        console.log(formattedCourses);

        console.log("Exit history API");
        res.json(formattedCourses);
    } catch (error) {
        console.error("Error fetching course history:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

  






  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
