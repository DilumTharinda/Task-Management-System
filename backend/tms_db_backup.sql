-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: group10-tms.mysql.database.azure.com    Database: tms_db
-- ------------------------------------------------------
-- Server version	8.0.44-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `storedFileName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filePath` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileSize` int NOT NULL,
  `taskId` int NOT NULL,
  `uploadedBy` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  KEY `uploadedBy` (`uploadedBy`),
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`uploadedBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
INSERT INTO `attachments` VALUES (8,'Alan Dennis, Barbara Haley Wixom, David Tegarden-Systems Analysis and Design_ An Object-Oriented Approach with UML-Wiley (2015).pdf','1776525133843-364515.pdf','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776525133843-364515.pdf','application/pdf',213439,9,1,'2026-04-18 03:31:18','2026-04-18 15:12:14'),(9,'ANDROID.png','1776497814541-579072.png','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776497814541-579072.png','image/png',316796,8,1,'2026-04-18 07:36:56','2026-04-18 07:36:56'),(10,'Analog Electronic.docx','1776497824389-393342.docx','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776497824389-393342.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',84017,8,1,'2026-04-18 07:37:04','2026-04-18 07:37:04'),(11,'Alan Dennis, Barbara Haley Wixom, David Tegarden-Systems Analysis and Design_ An Object-Oriented Approach with UML-Wiley (2015).pdf','1776497873042-33131.pdf','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776497873042-33131.pdf','application/pdf',213439,8,1,'2026-04-18 07:37:54','2026-04-18 07:37:54'),(12,'IT_Infrastructure_StudyNotes.docx','1776508525036-338860.docx','D:\\University\\Kelaniya\\Study\\Level 2\\Semester 1\\INTE 21323 - Web Application Development\\Final Project\\tms-project\\backend\\uploads\\tasks\\1776508525036-338860.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',25513,9,6,'2026-04-18 10:35:25','2026-04-18 10:35:25');
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` int NOT NULL,
  `userId` int NOT NULL,
  `attachmentId` int DEFAULT NULL,
  `commentFileName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentStoredFileName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentFilePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentFileType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentFileSize` int DEFAULT NULL,
  `isEdited` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  KEY `userId` (`userId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (3,'Please check this file 📎',2,2,NULL,'Screenshot from 2026-02-18 16-12-04.png','1776185802486-663847.png','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776185802486-663847.png','image/png',219924,0,'2026-04-14 16:56:43','2026-04-14 16:56:43'),(5,'This is my second comment 😊',4,2,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-15 04:02:18','2026-04-15 04:02:18'),(6,'This is  comment 😊',4,2,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-15 04:07:15','2026-04-15 04:07:15'),(7,'Please check this file 📎',6,4,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-15 04:28:09','2026-04-15 04:28:09'),(8,'Hi',8,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-17 18:27:07','2026-04-17 18:27:07'),(9,'Hello users, I am Admin',8,1,NULL,'ANDROID.png','1776450448286-371905.png','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776450448286-371905.png','image/png',316796,1,'2026-04-17 18:27:29','2026-04-18 15:39:15'),(10,'Hello',9,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-18 02:58:39','2026-04-18 02:58:39'),(11,'d',9,1,NULL,'digital-digital-art-artwork-illustration-abstract-hd-wallpaper-28f60d7850600cb8e04c418e2872141a.jpg','1776481133872-227114.jpg','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776481133872-227114.jpg','image/jpeg',619448,0,'2026-04-18 02:58:54','2026-04-18 02:58:54'),(12,'d',9,1,NULL,'digital-digital-art-artwork-illustration-abstract-hd-wallpaper-28f60d7850600cb8e04c418e2872141a.jpg','1776481135564-361698.jpg','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776481135564-361698.jpg','image/jpeg',619448,0,'2026-04-18 02:58:55','2026-04-18 02:58:55'),(13,'Hello admin',9,5,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-18 03:04:57','2026-04-18 03:04:57'),(14,'x',9,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-18 04:18:38','2026-04-18 04:18:38'),(15,'Hello This is testing',8,2,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-04-18 06:35:43','2026-04-18 06:53:36'),(16,'Hello files',8,2,NULL,'Analog Electronic.docx','1776494795725-675724.docx','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776494795725-675724.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',84017,0,'2026-04-18 06:46:36','2026-04-18 06:46:36'),(18,'HI',8,2,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-18 06:54:34','2026-04-18 06:54:34'),(19,'hello',9,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-18 07:27:34','2026-04-18 07:27:34'),(20,'',8,1,NULL,'Analog Electronic.docx','1776498031191-612527.docx','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776498031191-612527.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',84017,0,'2026-04-18 07:40:31','2026-04-18 07:40:31'),(21,'Hello Users',9,6,NULL,'SAD_Study_Notes.docx','1776508582393-994372.docx','D:\\University\\Kelaniya\\Study\\Level 2\\Semester 1\\INTE 21323 - Web Application Development\\Final Project\\tms-project\\backend\\uploads\\tasks\\1776508582393-994372.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',348257,0,'2026-04-18 10:36:24','2026-04-18 10:36:24'),(22,'',9,1,NULL,'Analog Electronic.docx','1776525174936-399095.docx','/media/androidboy/Media/University/Kelaniya/Study/Level 2/Semester 1/INTE 21323 - Web Application Development/Final Project/tms-project/backend/uploads/tasks/1776525174936-399095.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',84017,0,'2026-04-18 15:12:55','2026-04-18 15:12:55'),(23,'Hello',9,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-04-18 15:13:13','2026-04-18 15:13:34');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('task_assigned','task_updated','status_changed','comment_added','deadline_approaching','general') DEFAULT 'general',
  `taskId` int DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'New Task Assigned','You have been assigned to task: Build the login page','task_assigned',7,1,'2026-04-17 12:36:27','2026-04-17 12:51:48'),(2,2,'New Task Assigned','You have been assigned to task: Build the login page','task_assigned',7,1,'2026-04-17 12:36:31','2026-04-18 15:14:28'),(3,4,'New Task Assigned','You have been assigned to task: Build the login page','task_assigned',7,1,'2026-04-17 12:36:35','2026-04-17 19:16:03'),(4,2,'Added to Task','You have been added to task: API','task_assigned',4,1,'2026-04-17 12:40:43','2026-04-18 15:14:28'),(5,4,'Added to Task','You have been added to task: API','task_assigned',4,1,'2026-04-17 12:40:51','2026-04-17 19:16:03'),(6,1,'Task Status Updated','Task \"Build the login page\" status changed from To Do to In Progress','status_changed',7,1,'2026-04-17 12:46:07','2026-04-17 12:52:41'),(7,2,'Task Status Updated','Task \"Build the login page\" status changed from To Do to In Progress','status_changed',7,1,'2026-04-17 12:46:07','2026-04-17 18:31:02'),(8,4,'Task Status Updated','Task \"Build the login page\" status changed from To Do to In Progress','status_changed',7,1,'2026-04-17 12:46:07','2026-04-17 19:16:03'),(9,2,'New Task Assigned','You have been assigned to task: Test','task_assigned',8,1,'2026-04-17 17:29:20','2026-04-17 18:31:01'),(10,4,'New Task Assigned','You have been assigned to task: Test','task_assigned',8,1,'2026-04-17 17:29:24','2026-04-17 19:16:03'),(11,2,'Task Status Updated','Task \"Test\" status changed from To Do to In Progress','status_changed',8,1,'2026-04-17 17:32:38','2026-04-18 15:14:28'),(12,4,'Task Status Updated','Task \"Test\" status changed from To Do to In Progress','status_changed',8,1,'2026-04-17 17:32:38','2026-04-17 19:16:03'),(13,2,'Task Status Updated','Task \"Test\" status changed from In Progress to To Do','status_changed',8,1,'2026-04-17 17:45:08','2026-04-18 15:14:28'),(14,4,'Task Status Updated','Task \"Test\" status changed from In Progress to To Do','status_changed',8,1,'2026-04-17 17:45:09','2026-04-17 19:16:03'),(15,2,'New Comment Added','Admin commented on task: Test','comment_added',8,1,'2026-04-17 18:27:07','2026-04-18 15:14:28'),(16,4,'New Comment Added','Admin commented on task: Test','comment_added',8,1,'2026-04-17 18:27:08','2026-04-17 19:16:03'),(17,2,'New Comment Added','Admin commented on task: Test','comment_added',8,1,'2026-04-17 18:27:29','2026-04-18 15:14:28'),(18,4,'New Comment Added','Admin commented on task: Test','comment_added',8,1,'2026-04-17 18:27:29','2026-04-17 19:16:01'),(19,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 02:58:39','2026-04-18 02:58:39'),(20,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 02:58:55','2026-04-18 02:58:55'),(21,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 02:58:56','2026-04-18 02:58:56'),(22,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 04:18:39','2026-04-18 04:18:39'),(23,5,'Task Status Updated','Task \"Project 2.0\" status changed from To Do to In Progress','status_changed',9,0,'2026-04-18 04:21:33','2026-04-18 04:21:33'),(24,5,'Task Status Updated','Task \"Build the API\" status changed from In Progress to To Do','status_changed',2,1,'2026-04-18 04:45:25','2026-04-18 07:21:19'),(25,4,'New Comment Added','Dilum Tharinda commented on task: Test','comment_added',8,0,'2026-04-18 06:35:44','2026-04-18 06:35:44'),(26,4,'New Comment Added','Dilum Tharinda commented on task: Test','comment_added',8,0,'2026-04-18 06:46:36','2026-04-18 06:46:36'),(27,4,'New Comment Added','Dilum Tharinda commented on task: Test','comment_added',8,0,'2026-04-18 06:54:19','2026-04-18 06:54:19'),(28,4,'New Comment Added','Dilum Tharinda commented on task: Test','comment_added',8,0,'2026-04-18 06:54:34','2026-04-18 06:54:34'),(29,2,'Task Status Updated','Task \"Test\" status changed from To Do to In Progress','status_changed',8,1,'2026-04-18 07:02:08','2026-04-18 15:14:28'),(30,4,'Task Status Updated','Task \"Test\" status changed from To Do to In Progress','status_changed',8,0,'2026-04-18 07:02:08','2026-04-18 07:02:08'),(31,2,'Task Status Updated','Task \"Test\" status changed from In Progress to To Do','status_changed',8,1,'2026-04-18 07:02:10','2026-04-18 15:14:28'),(32,4,'Task Status Updated','Task \"Test\" status changed from In Progress to To Do','status_changed',8,0,'2026-04-18 07:02:10','2026-04-18 07:02:10'),(33,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 07:27:34','2026-04-18 07:27:34'),(34,2,'New Comment Added','Admin commented on task: Test','comment_added',8,1,'2026-04-18 07:40:32','2026-04-18 15:14:28'),(35,4,'New Comment Added','Admin commented on task: Test','comment_added',8,0,'2026-04-18 07:40:32','2026-04-18 07:40:32'),(36,5,'New Comment Added','System Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 10:36:25','2026-04-18 10:36:25'),(37,2,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,1,'2026-04-18 15:12:55','2026-04-18 15:14:28'),(38,4,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:12:56','2026-04-18 15:12:56'),(39,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:12:56','2026-04-18 15:12:56'),(40,6,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:12:56','2026-04-18 15:12:56'),(41,2,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,1,'2026-04-18 15:13:14','2026-04-18 15:14:28'),(42,4,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:13:14','2026-04-18 15:13:14'),(43,5,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:13:14','2026-04-18 15:13:14'),(44,6,'New Comment Added','Admin commented on task: Project 2.0','comment_added',9,0,'2026-04-18 15:13:14','2026-04-18 15:13:14'),(45,2,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to To Do','status_changed',9,0,'2026-04-18 15:30:27','2026-04-18 15:30:27'),(46,4,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to To Do','status_changed',9,0,'2026-04-18 15:30:28','2026-04-18 15:30:28'),(47,5,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to To Do','status_changed',9,0,'2026-04-18 15:30:28','2026-04-18 15:30:28'),(48,6,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to To Do','status_changed',9,0,'2026-04-18 15:30:28','2026-04-18 15:30:28'),(49,2,'Task Status Updated','Task \"Project 2.0\" status changed from To Do to In Progress','status_changed',9,0,'2026-04-18 15:30:33','2026-04-18 15:30:33'),(50,4,'Task Status Updated','Task \"Project 2.0\" status changed from To Do to In Progress','status_changed',9,0,'2026-04-18 15:30:33','2026-04-18 15:30:33'),(51,5,'Task Status Updated','Task \"Project 2.0\" status changed from To Do to In Progress','status_changed',9,0,'2026-04-18 15:30:33','2026-04-18 15:30:33'),(52,6,'Task Status Updated','Task \"Project 2.0\" status changed from To Do to In Progress','status_changed',9,0,'2026-04-18 15:30:33','2026-04-18 15:30:33'),(53,2,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to Completed','status_changed',9,0,'2026-04-18 15:30:38','2026-04-18 15:30:38'),(54,4,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to Completed','status_changed',9,0,'2026-04-18 15:30:38','2026-04-18 15:30:38'),(55,5,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to Completed','status_changed',9,0,'2026-04-18 15:30:38','2026-04-18 15:30:38'),(56,6,'Task Status Updated','Task \"Project 2.0\" status changed from In Progress to Completed','status_changed',9,0,'2026-04-18 15:30:39','2026-04-18 15:30:39'),(57,2,'Task Status Updated','Task \"Project 2.0\" status changed from Completed to To Do','status_changed',9,0,'2026-04-18 15:30:46','2026-04-18 15:30:46'),(58,4,'Task Status Updated','Task \"Project 2.0\" status changed from Completed to To Do','status_changed',9,0,'2026-04-18 15:30:47','2026-04-18 15:30:47'),(59,5,'Task Status Updated','Task \"Project 2.0\" status changed from Completed to To Do','status_changed',9,0,'2026-04-18 15:30:47','2026-04-18 15:30:47'),(60,6,'Task Status Updated','Task \"Project 2.0\" status changed from Completed to To Do','status_changed',9,0,'2026-04-18 15:30:47','2026-04-18 15:30:47');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taskassignees`
--

DROP TABLE IF EXISTS `taskassignees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taskassignees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TaskAssignees_userId_taskId_unique` (`taskId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `taskassignees_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `taskassignees_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taskassignees`
--

LOCK TABLES `taskassignees` WRITE;
/*!40000 ALTER TABLE `taskassignees` DISABLE KEYS */;
INSERT INTO `taskassignees` VALUES (5,4,4,'2026-04-17 12:40:27','2026-04-17 12:40:27'),(6,8,2,'2026-04-17 17:29:16','2026-04-17 17:29:16'),(7,8,4,'2026-04-17 17:29:16','2026-04-17 17:29:16'),(11,2,5,'2026-04-18 04:23:37','2026-04-18 04:23:37'),(19,9,2,'2026-04-18 15:31:52','2026-04-18 15:31:52'),(20,9,4,'2026-04-18 15:31:52','2026-04-18 15:31:52'),(21,9,5,'2026-04-18 15:31:52','2026-04-18 15:31:52'),(22,9,6,'2026-04-18 15:31:52','2026-04-18 15:31:52'),(23,6,4,'2026-04-18 18:06:02','2026-04-18 18:06:02'),(24,6,5,'2026-04-18 18:06:02','2026-04-18 18:06:02'),(25,3,2,'2026-04-18 18:06:39','2026-04-18 18:06:39');
/*!40000 ALTER TABLE `taskassignees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `assignedTo` int DEFAULT NULL,
  `createdBy` int NOT NULL,
  `dueDate` date DEFAULT NULL,
  `priority` enum('Low','Medium','High') COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `status` enum('To Do','In Progress','Completed') COLLATE utf8mb4_unicode_ci DEFAULT 'To Do',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assignedTo` (`assignedTo`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_10` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_11` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_12` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_5` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_6` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_7` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_8` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_9` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (2,'Build the API','Develop the REST API endpoints',2,1,'2026-06-01','High','To Do','2026-04-11 18:32:27','2026-04-18 04:45:25'),(3,'Design the login page','Create wireframes for the login screen',NULL,1,'2026-04-18','High','To Do','2026-04-11 18:50:58','2026-04-18 18:06:39'),(4,'API','Develop the REST API endpoints',2,1,'2026-04-28','High','To Do','2026-04-11 18:53:40','2026-04-17 17:27:58'),(6,'API','Develop the REST API endpoints',4,1,'2026-04-18','High','To Do','2026-04-15 04:20:21','2026-04-17 16:34:24'),(8,'Test','Test ddd',NULL,1,'2026-05-28','Low','To Do','2026-04-17 17:29:16','2026-04-18 07:02:10'),(9,'Project 2.0','Iot Project',NULL,4,'2026-04-19','Low','To Do','2026-04-17 19:20:05','2026-04-18 15:30:46');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Admin','ProjectManager','Collaborator') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `mustChangePassword` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `resetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetTokenExpiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `email_36` (`email`),
  UNIQUE KEY `email_37` (`email`),
  UNIQUE KEY `email_38` (`email`),
  UNIQUE KEY `email_39` (`email`),
  UNIQUE KEY `email_40` (`email`),
  UNIQUE KEY `email_41` (`email`),
  UNIQUE KEY `email_42` (`email`),
  UNIQUE KEY `email_43` (`email`),
  UNIQUE KEY `email_44` (`email`),
  UNIQUE KEY `email_45` (`email`),
  UNIQUE KEY `email_46` (`email`),
  UNIQUE KEY `email_47` (`email`),
  UNIQUE KEY `email_48` (`email`),
  UNIQUE KEY `email_49` (`email`),
  UNIQUE KEY `email_50` (`email`),
  UNIQUE KEY `email_51` (`email`),
  UNIQUE KEY `email_52` (`email`),
  UNIQUE KEY `email_53` (`email`),
  UNIQUE KEY `email_54` (`email`),
  UNIQUE KEY `email_55` (`email`),
  UNIQUE KEY `email_56` (`email`),
  UNIQUE KEY `email_57` (`email`),
  UNIQUE KEY `email_58` (`email`),
  UNIQUE KEY `email_59` (`email`),
  UNIQUE KEY `email_60` (`email`),
  UNIQUE KEY `email_61` (`email`),
  UNIQUE KEY `email_62` (`email`),
  UNIQUE KEY `email_63` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'TMS Admin','testdilum45@gmail.com','$2b$10$96p8GtuxsdPg1Hca/mFEgeqBeTTrhBwpjgk06sCAGV4LwHZEiAvCG','Admin',1,0,'2026-04-11 07:34:31','2026-04-18 15:44:00',NULL,NULL),(2,'Dilum Tharinda','tharindadilum6@gmail.com','$2b$10$wBVlqMc56/iqHYPu1J45ze/6UiLCwIAd5dRotp2thMS03Qok.PF5W','ProjectManager',1,0,'2026-04-11 07:52:29','2026-04-18 15:29:53','c800abbe6ba11d622c89fda7666dd6fbd6a7c1df662dd5bf6d9da97e3bf65bd6','2026-04-17 16:05:42'),(4,'Dissanayake','dilumtharinda09@gmail.com','$2b$10$5P0uNAp1pkGfbMhgdhSya.TtbIxgv2ZtZJVNs7wCeGQOAd3pD0gGq','ProjectManager',1,0,'2026-04-15 04:08:51','2026-04-17 18:53:45','926c4d36e5d92eb0e3531d624f9f63ae247a9445342d98f4fa35ce2344970fdc','2026-04-17 18:53:19'),(5,'Kavindu Nimsara','promotetestmail4@gmail.com','$2b$10$.LhmQGD61Puo6aejAGBE9ukaq6A/gV3E63x4s36StODUOV4Z7wKI.','Collaborator',1,0,'2026-04-17 19:09:57','2026-04-18 15:36:09',NULL,NULL),(6,'System Admin','admin@tms.com','$2b$10$1ZaETSyyRmxLc50bKbB0v.xeFy0k3L6hvOAtb8ygqlcAfJHFhaHQ6','Admin',1,0,'2026-04-18 10:32:41','2026-04-18 10:32:41',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 23:57:54
