-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2024 at 03:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `demobackend`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `admin_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `bookmark_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `total_votes` int(11) DEFAULT NULL,
  `bookmark_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookmarks`
--

INSERT INTO `bookmarks` (`bookmark_id`, `student_id`, `project_id`, `title`, `department_name`, `total_votes`, `bookmark_timestamp`) VALUES
(2, 202000762, 4, 'GPMS', 'is', 0, '2024-05-03 22:34:43'),
(3, 202000762, 3, 'hamadahamada', 'manal', 0, '2024-05-03 22:39:51'),
(4, 202000761, 1, 'Ay haga', NULL, 4, '2024-05-04 10:50:07'),
(7, 202000761, 1, 'ay klam', 'is', 6, '2024-05-06 15:41:43'),
(12, 202000761, 4, 'GPMS', 'is', 0, '2024-05-06 16:36:17');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `commenter_id` int(11) DEFAULT NULL,
  `comment_text` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `commenter_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`comment_id`, `project_id`, `commenter_id`, `comment_text`, `timestamp`, `commenter_name`) VALUES
(4, 1, 202000762, 'This is a test comment.', '2024-05-03 22:03:23', 'Mohamed Zain'),
(16, 1, 202000761, 'Your comment text here', '2024-05-04 10:45:28', 'Mohamed Zain'),
(18, 4, 202000761, 'Your comment text here', '2024-05-06 15:40:52', 'Mohamed Zain');

-- --------------------------------------------------------

--
-- Table structure for table `professor`
--

CREATE TABLE `professor` (
  `professor_id` int(11) NOT NULL,
  `professor_name` varchar(255) NOT NULL,
  `professor_email` varchar(255) NOT NULL,
  `professor_password` varchar(255) NOT NULL,
  `professor_department` varchar(255) NOT NULL,
  `professor_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professor`
--

INSERT INTO `professor` (`professor_id`, `professor_name`, `professor_email`, `professor_password`, `professor_department`, `professor_token`) VALUES
(809000586, 'Abdelrahman', 'Ebnelnas@fci.helwan.edu.eg', '$2b$10$MrR3dXPx.cDt4A2rnf0NA.S9ACnNqVkZED5tCFgmM8tGu1e2CHUq6', 'cs', 'b977b6c231f130f19df2aa0bc109f1bc'),
(202000496, 'Hany Abdelrazek', 'hanyhany@fci.helwan.edu.eg', '$2b$10$Xpqq1qOtAtFB760uVb7inuF8Az09xDhXUUW5FN7t6TJlNvT5nTpvu', 'is', '1090d36f6a263870b47346abca52750d'),
(20200, 'Abdelrahman ahmed', 'abdo.ahmed@fci.helwan.edu.eg', '$2b$10$Y3H.JKJmOQXiew5hsmbXpuwrfqFAbpBVfelKJYOwFA0T0j2aRKF1W', 'Computer Science', 'a566e7d37112a792a736c2427bc52ba9');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `graduation_year` int(11) DEFAULT NULL,
  `graduation_term` enum('June','January','Summer') DEFAULT NULL,
  `department_name` enum('Computer Science','Information Systems','Information Technology','Artificial Intelligence') DEFAULT NULL,
  `project_files_path` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `total_votes` int(11) DEFAULT 0,
  `professor_id` int(11) DEFAULT NULL,
  `registration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `title`, `description`, `supervisor_name`, `graduation_year`, `graduation_term`, `department_name`, `project_files_path`, `github_link`, `approval_status`, `total_votes`, `professor_id`, `registration_date`) VALUES
(1, 'ay klam', 'hello', 'mar3333eeeeeeeeeeee', 2024, '', '', NULL, 'ay 7aga', 'Approved', 6, NULL, '2024-05-06'),
(2, 'Project Title123', 'gthgtughurrreuifhfhhfj', 'Supervisor Name', 2024, '', '', NULL, 'https://github.com/example/project', 'Rejected', 1, NULL, NULL),
(3, 'hamadahamada', 'hamadahamada', 'hamadahamada', 2027, '', '', NULL, 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(4, 'GPMS', 'kter', 'DR MAray', 2024, '', '', 'project_files\\1714685518174.rar', 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(5, 'hamadahamada1333', 'hamadahamada', 'hamadahamada111', 3333, '', '', NULL, 'hamada.com/github_link ', 'Pending', 0, NULL, NULL),
(28, 'ay klam', 'hello', 'mar3333eeeeeeeeeeee', 2024, '', '', NULL, 'ay 7aga', 'Pending', 0, NULL, NULL),
(29, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, '', '', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(30, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, '', '', NULL, 'ta3ban', 'Approved', 0, NULL, NULL),
(31, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, '', '', NULL, 'ta3ban', 'Approved', 0, NULL, '2024-05-05'),
(32, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, '', '', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(33, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, '', '', NULL, 'ta3ban', 'Pending', 0, 809000586, NULL),
(34, 'Sample Project', 'This is a sample project description', 'Mohamed Maray', 2024, '', '', 'project_files\\1715007907218.png', 'https://github.com/sample/project', 'Pending', 0, 809000586, NULL),
(35, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, 'Summer', '', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(36, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, 'Summer', 'Computer Science', NULL, 'ta3ban', 'Pending', 0, NULL, NULL),
(37, 'zain', 'hamadahamada', 'Maray', 2024, 'June', 'Information Systems', 'project_files\\1715050231688.png', 'zain.com', 'Pending', 0, 20200, NULL),
(38, 'zain', 'zain bardo', 'Maray', 2024, 'June', 'Information Systems', 'project_files\\1715050538588.png', 'zain.com', 'Pending', 0, 20200, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_professor`
--

CREATE TABLE `project_professor` (
  `project_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_professor`
--

INSERT INTO `project_professor` (`project_id`, `professor_id`) VALUES
(30, 809000586),
(30, 809000586),
(31, 809000586),
(1, 20200);

-- --------------------------------------------------------

--
-- Table structure for table `project_students`
--

CREATE TABLE `project_students` (
  `project_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `semester_work_grade` decimal(5,2) DEFAULT NULL,
  `final_work_grade` decimal(5,2) DEFAULT NULL,
  `max_semester_work_grade` decimal(5,2) DEFAULT NULL,
  `max_final_work_grade` decimal(5,2) DEFAULT NULL,
  `overall_grade` decimal(5,2) GENERATED ALWAYS AS (`semester_work_grade` + `final_work_grade`) VIRTUAL,
  `max_overall_grade` decimal(5,2) GENERATED ALWAYS AS (`max_semester_work_grade` + `max_final_work_grade`) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_students`
--

INSERT INTO `project_students` (`project_id`, `student_name`, `student_id`, `semester_work_grade`, `final_work_grade`, `max_semester_work_grade`, `max_final_work_grade`) VALUES
(3, 'Jane Smith', '16', NULL, NULL, NULL, NULL),
(3, 'Mike Jones', '17', NULL, NULL, NULL, NULL),
(28, 'Zain', '202000762', NULL, NULL, NULL, NULL),
(28, 'Hazem', '202000210', NULL, NULL, NULL, NULL),
(28, 'Abdelrahman', '202000752', NULL, NULL, NULL, NULL),
(29, 'hhhhn', '202000777', NULL, NULL, NULL, NULL),
(29, 'Hazeyyy', '202000222', NULL, NULL, NULL, NULL),
(29, 'Abdelrahman', '202000232', NULL, NULL, NULL, NULL),
(30, 'hhhhn', '202000777', NULL, NULL, NULL, NULL),
(30, 'Hazeyyy', '202000222', 60.00, 150.00, 100.00, 200.00),
(30, 'Abdelrahman', '202000232', NULL, NULL, NULL, NULL),
(31, 'messi', '202000999', 500.00, 500.00, 500.00, 500.00),
(31, 'abdelsalam', '202000333', NULL, NULL, NULL, NULL),
(31, 'embabe', '202000555', NULL, NULL, NULL, NULL),
(32, 'messi', '202000666', NULL, NULL, NULL, NULL),
(32, 'abdelsalam', '202000888', NULL, NULL, NULL, NULL),
(32, 'embabe', '202000111', NULL, NULL, NULL, NULL),
(33, 'messi', '121', NULL, NULL, NULL, NULL),
(33, 'abdelsalam', '122', NULL, NULL, NULL, NULL),
(33, 'embabe', '123', NULL, NULL, NULL, NULL),
(1, 'John Doe', '202100001', 85.50, 90.00, 100.00, 100.00),
(1, 'Jane Smith', '202100002', 78.00, 85.50, 100.00, 100.00),
(1, 'Alice Johnson', '202100003', 92.00, 88.50, 100.00, 100.00),
(2, 'John Doe', '123456', 80.00, 85.00, 90.00, 95.00),
(2, 'Jane Smith', '789012', 75.00, 90.00, 85.00, 92.00),
(2, 'Alice Johnson', '345678', 85.00, 80.00, 88.00, 87.00),
(34, 'Mohamed zain-Elabdeen', '20200076', NULL, NULL, NULL, NULL),
(34, 'Hazem Hamdy', '20200024', NULL, NULL, NULL, NULL),
(35, 'hhhhn', '2020007', NULL, NULL, NULL, NULL),
(35, 'Hazeyyy', '2020002', NULL, NULL, NULL, NULL),
(35, 'Abdelrahman', '2020032', NULL, NULL, NULL, NULL),
(36, 'hhhhn', '202000700', NULL, NULL, NULL, NULL),
(36, 'Hazeyyy', '202000000', NULL, NULL, NULL, NULL),
(37, 'zainjr', '1010', NULL, NULL, NULL, NULL),
(38, 'zainjr', '10100', NULL, NULL, NULL, NULL);

--
-- Triggers `project_students`
--
DELIMITER $$
CREATE TRIGGER `update_max_overall_grade` BEFORE UPDATE ON `project_students` FOR EACH ROW BEGIN
    SET NEW.max_overall_grade = NEW.max_semester_work_grade + NEW.max_final_work_grade;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_overall_grade` BEFORE UPDATE ON `project_students` FOR EACH ROW BEGIN
    SET NEW.overall_grade = NEW.semester_work_grade + NEW.final_work_grade;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  `student_department` varchar(255) DEFAULT NULL,
  `student_token` varchar(255) NOT NULL DEFAULT 'hello'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_name`, `student_email`, `student_password`, `student_department`, `student_token`) VALUES
(0, 'Mohamed zain', 'john.doe@fci.helwan.edu.eg', '$2b$10$wkVr6uuRfdajrSQ07t/OAuOBwn8exc0847FDEWKq4Y0iX/bQhf58S', '', 'd5fde16db6375adc6687a3beb23588e6'),
(7, 'Mohamed Zain', 'Mohamed_Zain@fci.helwan.edu.eg', '$2b$10$HboC7yQbxbNbfNAGhnrif.n0H/0Br6xw1bORhSzRUYqPlSk.vQYwG', NULL, '64fa3d60ebb4be5d98e65ac11b129971'),
(8, 'Mohamed Ahmed', 'Mohamed_Ahmed@fci.helwan.edu.eg', '$2b$10$h3qVOArAI..W4ZdIDvH6/uyBXKMGPq9khAOrio.TrTye5UH1M48i6', NULL, '6ef85404ec5c8b999f5f703584379e37'),
(9, 'admin admin', 'admin@fci.helwan.edu.eg', '$2b$10$Rrz45r/CQ1JT3P9H12MYMOYcNMZJb2UDp3g7mxELtvWvtJpxntdBy', NULL, ''),
(10, 'admin hello', 'helllllllll@fci.helwan.edu.eg', '$2b$10$2imy8DN1H3vZ9vGdzjjDwepImLKKZ/sxbulWUmXEzQ7cJdm.JzM3q', NULL, ''),
(11, 'admin hello', 'youyou@fci.helwan.edu.eg', '$2b$10$k3anRZtkhnlQmDhDSOk7SOX3aAKrItRbYbqbptMcWdeD7ZRGeemA6', NULL, ''),
(202000245, 'Hazem hamdy', 'hazem@fci.helwan.edu.eg', '$2b$10$.wt2iATEk/59LHhiQEouOeOSGXapJTmfbLVDIVojzg6naWmY85aKi', 'Software Engineering', '79673a812778cc0556aaa47818ce0bb4'),
(202000760, '’Mohamed Zain', 'Mohamedzain235@fci.helwan.edu.eg', '$2b$10$.2axmfsaKj2EcgKFbnGqv.uhfu8FPJWmIWAEkk3NWcBufhaK8IBla', 'Information systems', 'f940a7a81f9a45bfd8f0dc715b6c8e70'),
(202000761, 'Mohamed Zain', 'jon@fci.helwan.edu.eg', '$2b$10$vlsDivDwlWUXlpuoZ121p.3HuvqNDWhdo3DlmNv.VoXhFB/0qKPv6', 'Software Engineering', '86ac195bf92d16376e870b0f638866f4'),
(202000762, 'Mohamed Zain', 'john@fci.helwan.edu.eg', '$2b$10$65z7DgiOmWHGz1ycemwniOmnAvIN6z409A6Hl0y2g.u855vpod6mm', 'Software Engineering', '17314c1288b5441d770c7e2c3ffa396d');

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `vote_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `votes`
--

INSERT INTO `votes` (`vote_id`, `project_id`, `student_id`, `timestamp`) VALUES
(3, 1, 202000762, '2024-05-06 12:26:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `admin_email` (`admin_email`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`bookmark_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `commenter_id` (`commenter_id`);

--
-- Indexes for table `professor`
--
ALTER TABLE `professor`
  ADD KEY `professor_id_index` (`professor_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`);

--
-- Indexes for table `project_professor`
--
ALTER TABLE `project_professor`
  ADD KEY `project_id` (`project_id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- Indexes for table `project_students`
--
ALTER TABLE `project_students`
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`vote_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookmarks`
--
ALTER TABLE `bookmarks`
  MODIFY `bookmark_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `vote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`commenter_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `project_professor`
--
ALTER TABLE `project_professor`
  ADD CONSTRAINT `project_professor_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `project_professor_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`professor_id`);

--
-- Constraints for table `project_students`
--
ALTER TABLE `project_students`
  ADD CONSTRAINT `project_students_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
