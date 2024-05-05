-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 06, 2024 at 12:00 AM
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
-- Database: `demobackend3`
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
(2, 202000762, 4, 'GPMS', 'is', 0, '2024-05-04 01:34:43'),
(3, 202000762, 3, 'hamadahamada', 'manal', 0, '2024-05-04 01:39:51'),
(4, 202000761, 1, 'Ay haga', NULL, 4, '2024-05-04 13:50:07');

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
(4, 1, 202000762, 'This is a test comment.', '2024-05-04 01:03:23', 'Mohamed Zain'),
(5, 1, 202000762, 'This is a test comment.', '2024-05-04 01:04:35', 'Mohamed Zain'),
(16, 1, 202000761, 'Your comment text here', '2024-05-04 13:45:28', 'Mohamed Zain');

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
(0, 'Mohamed zain', 'john.doe@example.com', 'password123', 'Computer Science', 'cef018f680c2ee0ab85fb35d0432cc78'),
(0, 'Mohamed zain', 'john.doe@example.com', 'password123', 'Computer Science', '8c45db7b241f3e203cbe53ece65ce4a4'),
(0, 'Mohamed zain', 'john.doe@example.com', '$2b$10$EJvXMDkwhUOhgGtKyOPxEOl7YfSQ9ZpnK/nI27V0e7O2f9mWgY9DW', 'Computer Science', '2a4fb57558698052be59960f474cf6c4');

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
  `graduation_term` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `project_files_path` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `total_votes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `title`, `description`, `supervisor_name`, `graduation_year`, `graduation_term`, `department_name`, `project_files_path`, `github_link`, `approval_status`, `total_votes`) VALUES
(1, 'Ay haga', 'zain', 'Mar3y ', NULL, NULL, NULL, NULL, NULL, 'Pending', 8),
(2, 'Project Title123', 'gthgtughurrreuifhfhhfj', 'Supervisor Name', 2024, 'Spring', 'Computer Science', NULL, 'https://github.com/example/project', 'Pending', 0),
(3, 'hamadahamada', 'hamadahamada', 'hamadahamada', 2027, 'summer', 'manal', NULL, 'hamada.com/github_link ', 'Pending', 0),
(4, 'GPMS', 'kter', 'DR MAray', 2024, 'june', 'is', 'project_files\\1714685518174.rar', 'hamada.com/github_link ', 'Pending', 0),
(5, 'ay klam faaaddy', 'hedddd', 'manaaaaal', 2025, 'summerr', 'iscs', NULL, 'ta3ban', 'Pending', 0);

-- --------------------------------------------------------

--
-- Table structure for table `project_professor`
--

CREATE TABLE `project_professor` (
  `project_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `status` enum('Accepted','Rejected','Pending') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_students`
--

CREATE TABLE `project_students` (
  `project_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_id` varchar(255) DEFAULT NULL,
  `semester_work_grade` decimal(5,2) DEFAULT NULL,
  `final_work_grade` decimal(5,2) DEFAULT NULL,
  `overall_grade` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_students`
--

INSERT INTO `project_students` (`project_id`, `student_name`, `student_id`, `semester_work_grade`, `final_work_grade`, `overall_grade`) VALUES
(3, 'Jane Smith', '16', NULL, NULL, NULL),
(3, 'Mike Jones', '17', NULL, NULL, NULL),
(3, 'Jane Smith', '654321', NULL, NULL, NULL),
(3, 'Mike Jones', '987654', NULL, NULL, NULL),
(5, 'hhhhn', '202000777', NULL, NULL, NULL),
(5, 'Hazeyyy', '202000222', NULL, NULL, NULL),
(5, 'Abdelrahman', '202000232', NULL, NULL, NULL);

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
  `student_project_id` int(11) DEFAULT NULL,
  `student_token` varchar(255) NOT NULL DEFAULT 'hello'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_name`, `student_email`, `student_password`, `student_department`, `student_project_id`, `student_token`) VALUES
(0, 'Mohamed zain', 'john.doe@fci.helwan.edu.eg', '$2b$10$wkVr6uuRfdajrSQ07t/OAuOBwn8exc0847FDEWKq4Y0iX/bQhf58S', '', NULL, 'd5fde16db6375adc6687a3beb23588e6'),
(7, 'Mohamed Zain', 'Mohamed_Zain@fci.helwan.edu.eg', '$2b$10$HboC7yQbxbNbfNAGhnrif.n0H/0Br6xw1bORhSzRUYqPlSk.vQYwG', NULL, NULL, '64fa3d60ebb4be5d98e65ac11b129971'),
(8, 'Mohamed Ahmed', 'Mohamed_Ahmed@fci.helwan.edu.eg', '$2b$10$h3qVOArAI..W4ZdIDvH6/uyBXKMGPq9khAOrio.TrTye5UH1M48i6', NULL, NULL, '6ef85404ec5c8b999f5f703584379e37'),
(9, 'admin admin', 'admin@fci.helwan.edu.eg', '$2b$10$Rrz45r/CQ1JT3P9H12MYMOYcNMZJb2UDp3g7mxELtvWvtJpxntdBy', NULL, NULL, ''),
(10, 'admin hello', 'helllllllll@fci.helwan.edu.eg', '$2b$10$2imy8DN1H3vZ9vGdzjjDwepImLKKZ/sxbulWUmXEzQ7cJdm.JzM3q', NULL, NULL, ''),
(11, 'admin hello', 'youyou@fci.helwan.edu.eg', '$2b$10$k3anRZtkhnlQmDhDSOk7SOX3aAKrItRbYbqbptMcWdeD7ZRGeemA6', NULL, NULL, ''),
(12, 'admin hello', 'youyouyou@fci.helwan.edu.eg', '$2b$10$IRSq/VqIoN0AiHkicDA/RenywvSzJAXsUH/kQmzwrYruWhSh8RL5y', NULL, NULL, '017b7e73df18c3b285a18bfffb6526ce'),
(202000245, 'Hazem hamdy', 'hazem@fci.helwan.edu.eg', '$2b$10$RXTt9qNhq7gfEvDDfBtf.e7T5IPyurWo7Y/cjlHO16Tl84oDV7CeG', 'Software Engineering', NULL, 'e48ad5d6632dbf969b97a577490858f7'),
(202000761, 'Mohamed Zain', 'jon@fci.helwan.edu.eg', '$2b$10$vlsDivDwlWUXlpuoZ121p.3HuvqNDWhdo3DlmNv.VoXhFB/0qKPv6', 'Software Engineering', NULL, '86ac195bf92d16376e870b0f638866f4'),
(202000762, 'Mohamed Zain', 'john@fci.helwan.edu.eg', '$2b$10$65z7DgiOmWHGz1ycemwniOmnAvIN6z409A6Hl0y2g.u855vpod6mm', 'Software Engineering', NULL, '17314c1288b5441d770c7e2c3ffa396d');

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
(5, 1, 202000245, '2024-05-05 12:53:44'),
(8, 1, 12, '2024-05-05 12:53:58'),
(9, 1, 11, '2024-05-05 12:54:02');

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
  MODIFY `bookmark_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `vote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
