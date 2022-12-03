-- -- Database: restaurant

-- -- DROP DATABASE IF EXISTS restaurant;

-- --  CREATE DATABASE restaurant
-- --      WITH
-- --      OWNER = postgres
-- --      ENCODING = 'UTF8'
-- --      LC_COLLATE = 'en_US.utf8'
-- --      LC_CTYPE = 'en_US.utf8'
-- --      TABLESPACE = pg_default
-- --      CONNECTION LIMIT = -1
-- -- 	 TEMPLATE template0
-- --      IS_TEMPLATE = False;

-- Create TYPE basic_status AS ENUM ('ACTIVE', 'INACTIVE');
-- CREATE TYPE user_status AS ENUM ('ONLINE', 'OFFLINE', 'INACTIVE');
-- CREATE TYPE table_status AS ENUM ('NOT_USE', 'IN_USE', 'INACTIVE');
-- CREATE TYPE	check_status AS ENUM ('ACTIVE', 'CLOSED', 'VOID');
-- CREATE TYPE	checkdetail_status AS ENUM ('WAITING', 'READY', 'SERVED','RECALL', 'VOID');
-- Create TYPE bill_status AS ENUM ('CLOSED','REFUND');
-- Create TYPE cashierlog_type AS ENUM ('OPEN','CLOSED');
-- Create TYPE outofstock_status AS ENUM ('EMPTY','WARNING');

-- CREATE TABLE role (
-- 	id serial primary key,
-- 	name text UNIQUE not null
-- );
	
-- CREATE TABLE account (
--   id serial primary key,
--   username text unique NOT NULL,
--   password text NOT NULL,
--   fullName text NOT NULL,
--   avatar text DEFAULT NULL,
--   email text unique NOT NULL,
--   phone text unique NOT NULL,
--   status user_status default 'OFFLINE',
--   roleId integer NOT NULL references role(id)
-- );

-- CREATE TABLE worksession (
--   id serial primary key,
--   workDate date NOT NULL,
--   isOpen boolean NOT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL
-- );

-- CREATE TABLE voidreason (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE location (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status default 'ACTIVE'
-- );

-- CREATE TABLE shift (
--   id serial primary key,
--   workSessionId integer NOT NULL references worksession(id),
--   name text NOT NULL,
--   startTime time NOT NULL,
--   endTime time NOT NULL,
--   openerId integer DEFAULT NULL,
--   closerId integer DEFAULT NULL,
--   isOpen boolean NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE "table" (
--   id serial primary key,
--   locationId integer NOT NULL references location(id),
--   name text NOT NULL,
--   seat integer NOT NULL,
--   status table_status NOT NULL default 'NOT_USE'
-- );

-- CREATE TABLE "check" (
--   id serial primary key,
--   shiftId integer NOT NULL references shift(id),
--   accountId integer NOT NULL references account(id),
--   tableId int NOT NULL references "table"(id),
--   voidReasonId int DEFAULT NULL references voidreason(id),
--   checkNo text UNIQUE NOT NULL,
--   guestName text DEFAULT NULL,
--   cover integer DEFAULT NULL,
--   subtotal NUMERIC NOT NULL,
--   totalTax NUMERIC NOT NULL,
--   totalAmount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL,
--   status check_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE bill (
--   id serial primary key,
--   checkId integer NOT NULL references "check"(id),
--   billNo text unique NOT NULL,
--   guestName text DEFAULT NULL,
--   subtotal NUMERIC NOT NULL,
--   totalTax NUMERIC NOT NULL,
--   totalAmount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   creatorId integer NOT NULL,
--   creationTime timestamp without time zone NOT NULL,
--   updaterId integer DEFAULT NULL,
--   updateTime timestamp without time zone DEFAULT NULL,
--   status bill_status NOT NULL default 'CLOSED'
-- );

-- CREATE TABLE majorgroup (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE item (
--   id serial primary key,
--   majorGroupId integer NOT NULL references majorgroup(id),
--   image text DEFAULT NULL,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE billdetail (
--   id serial primary key,
--   billId integer not null references bill(id),
--   itemId integer NOT NULL references item(id),
--   itemName text NOT NULL,
--   itemPrice NUMERIC NOT NULL,
--   quantity float8 NOT NULL,
--   subtotal NUMERIC NOT NULL,
--   taxAmount NUMERIC NOT NULL,
--   amount NUMERIC NOT NULL
-- );

-- CREATE TABLE paymentmethod (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE billpayment (
--   id serial primary key,
--   billId integer not null references bill(id),
--   paymentMethodId int NOT NULL references paymentmethod(id),
--   paymentMethodName text NOT NULL,
--   amountReceive NUMERIC NOT NULL
-- );

-- CREATE TABLE checkdetail (
--   id serial primary key,
--   checkId integer NOT NULL references "check"(id) ON DELETE CASCADE,
--   itemId integer NOT NULL references item(id),
--   voidReasonId int DEFAULT NULL references voidreason(id),
--   itemPrice NUMERIC NOT NULL,
--   quantity float8 NOT NULL,
--   subtotal NUMERIC NOT NULL,
--   taxAmount NUMERIC NOT NULL,
--   amount NUMERIC NOT NULL,
--   note text DEFAULT NULL,
--   isReminded boolean NOT NULL,
--   status checkdetail_status NOT NULL default 'WAITING',
--   startTime time without time zone NOT NULL,
--   completionTime time without time zone default NULL
-- );

-- CREATE TABLE specialrequest (
--   id serial primary key,
--   majorGroupId integer NOT NULL references majorgroup(id),
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE checkdetailspecialrequest (
--   id serial primary key,
--   checkDetailId integer NOT NULL references checkdetail(id) ON DELETE CASCADE,
--   specialRequestId int NOT NULL references specialrequest(id)
-- );

-- CREATE TABLE itemoutofstock (
--   id serial primary key,
--   itemId integer UNIQUE NOT NULL references item(id),
--   status outofstock_status NOT NULL default 'EMPTY'
-- );

-- CREATE TABLE mealtype (
--   id serial primary key,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );

-- CREATE TABLE menu (
--   id serial primary key,
--   mealTypeId integer NOT NULL references mealtype(id),
--   isDefault boolean not null,
--   name text NOT NULL,
--   status basic_status NOT NULL default 'ACTIVE'
-- );


-- CREATE TABLE menuitem (
--   id serial primary key,
--   menuId integer NOT NULL references menu(id),
--   itemId integer NOT NULL references item(id),
--   price NUMERIC NOT NULL
-- );

-- CREATE TABLE systemsetting (
--   id serial primary key,
--   restaurantName text NOT NULL,
--   restaurantImage text DEFAULT NULL,
--   address text NOT NULL,
--   taxValue integer NOT NULL
-- );

-- CREATE TABLE "sessions"(
-- 	sid text primary key NOT NULL,
-- 	sess json NOT NULL,
-- 	expired TIMESTAMP without time zone NOT NULL
-- );

-- CREATE TABLE "cashierlog"(
-- 	id serial primary key,
-- 	accountId integer NOT NULL references "account"(id),
-- 	shiftId integer NOT NULL references "shift"(id),
--   	creationTime timestamp without time zone NOT NULL,
--   	updaterId integer DEFAULT NULL,
--   	updateTime timestamp without time zone DEFAULT NULL,
-- 	"type" cashierlog_type NOT NULL default 'OPEN',
-- 	amount NUMERIC NOT NULL,
-- 	isVerify boolean NOT NULL
-- );

-- --Basic
-- INSERT INTO role("name") VALUES('ADMIN');
-- INSERT INTO role("name") VALUES('MANAGER');
-- INSERT INTO role("name") VALUES('WAITER');
-- INSERT INTO role("name") VALUES('CASHIER');
-- INSERT INTO role("name") VALUES('KITCHEN_STAFF');

-- --Account
-- --password = 123qwe
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'admin','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyên Văn A','adminwork@gmail.com','0908888721','OFFLINE',(SELECT id FROM role WHERE name = 'ADMIN'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face1.jpg?alt=media&token=5bb9b934-0dcd-472c-9c01-7abcad725b0b');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'waiter','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Vĩ Cao Na','waiterwork@gmail.com','0908888722','OFFLINE',(SELECT id FROM role WHERE name = 'WAITER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face2.jpg?alt=media&token=7807aa71-06ba-4353-b508-29c451b96359');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'waiter1','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Thành Đại Mỹ','waiterwork1@gmail.com','0908888723','OFFLINE',(SELECT id FROM role WHERE name = 'WAITER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face3.jpg?alt=media&token=65a99768-776b-4251-aaea-bb84a3dcd9ed');	
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'cashier','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Trung Linh Công','cashierwork@gmail.com','0908888724','OFFLINE',(SELECT id FROM role WHERE name = 'CASHIER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face4.jpg?alt=media&token=a06ae462-6088-4523-aa99-fe0b9e41884d');
-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'kitchen','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Vinh Thế Minh','kitchenwork@gmail.com','0908888725','OFFLINE',(SELECT id FROM role WHERE name = 'KITCHEN_STAFF'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face5.jpg?alt=media&token=0a37a284-bc77-4b2a-8761-8e1a355d6508');

-- INSERT INTO account(username,password,fullname,email,phone,status,roleid,avatar) VALUES(
-- 	'manager','$2a$10$ZoIAJaHPngX8rnZ6RSl.neoFg8WsP/yWOE.OhuQ6/ECArQkNFbiJy','Nguyen Thanh Khanh','managerwork@gmail.com','09077888725','OFFLINE',(SELECT id FROM role WHERE name = 'MANAGER'),
-- 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/face6.jpg?alt=media&token=96a3c1c1-6138-4f49-9554-68115d237ebc');

-- --System settings.
-- INSERT INTO systemsetting(restaurantname,address,taxvalue,restaurantimage) VALUES('Restaurant A','Default Address', 10,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/logo.jpg?alt=media&token=1c4277c3-daf8-4f51-aeb0-fad84ec808d6');


-- --Worksession
-- INSERT INTO worksession(workdate,isopen,creatorid,creationtime) 
-- VALUES(CURRENT_DATE,true,(SELECT account.id FROM account JOIN "role" ON account.roleid = role.id WHERE role.name = 'ADMIN'),CURRENT_TIMESTAMP);

-- --Shift
-- -- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- -- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Default shift 1', NOW(),NOW(),true,'ACTIVE');

-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca sáng', '06:00:00','11:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca trưa', '11:00:00','14:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca tối', '14:00:00','22:00:00',false,'ACTIVE');
-- INSERT INTO shift(worksessionid,"name",starttime,endtime,isopen,status) 
-- VALUES((SELECT id from worksession WHERE isOpen = true AND workdate = CURRENT_DATE Limit 1),'Ca gãy', '22:00:00','23:59:00',false,'ACTIVE');

-- --Location
-- INSERT INTO "location"("name",status) VALUES('Khu vực chính','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Sân ngoài','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu A','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu B','ACTIVE');
-- INSERT INTO "location"("name",status) VALUES('Khu C','ACTIVE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF5',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF6',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF7',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name= 'Khu vực chính'  LIMIT 1),'MF8',8,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF9',8,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu vực chính'  LIMIT 1),'MF10',20,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Sân ngoài'  LIMIT 1),'OS5',4,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A' LIMIT 1),'A5',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu A'  LIMIT 1),'A6',8,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B'  LIMIT 1),'B4',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu B' LIMIT 1),'B5',6,'NOT_USE');

-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C1',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C2',2,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C3',4,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C'  LIMIT 1),'C4',6,'NOT_USE');
-- INSERT INTO "table"(locationid,"name",seat,status) VALUES((SELECT id FROM "location" WHERE status = 'ACTIVE' AND name = 'Khu C' LIMIT 1),'C5',8,'NOT_USE');

-- --Mealtype
-- INSERT INTO mealtype("name",status) VALUES('Bữa sáng','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Bữa trưa','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Bữa tối','ACTIVE');
-- INSERT INTO mealtype("name",status) VALUES('Mọi bữa','ACTIVE');

-- --Majorgroup
-- INSERT INTO majorgroup("name",status) VALUES('Khai vị','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món lẩu','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món nướng','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Tráng miệng','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Nước uống','ACTIVE');
-- INSERT INTO majorgroup("name",status) VALUES('Món khác','ACTIVE');

-- --Special request
-- --Khai vị
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nhiều tương ớt','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nhiều nước tương','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Thêm mayonnaise','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Không lấy rau ngò ','ACTIVE');

-- --Nươc uống
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Không đá ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nhiều đá ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Đá viên ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Đá nhuyễn','ACTIVE');

-- --Món lẩu
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Truyền Thống','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Kim Chi','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Tomyum','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Trường Thọ','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Chua Cay','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nước lẩu Tứ Xuyên','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Nhiều nước lẩu','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Phần ớt riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Mỹ tôm để nguyên gói','ACTIVE');

-- --Món nướng
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Không lấy mỡ dầu','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Để mỡ dầu riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Nướng sẵn','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Nhiều hành','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Không hành','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Thêm phần nấm trắng riêng','ACTIVE');
-- INSERT INTO specialrequest(majorgroupid,"name",status) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Phần sốt riêng','ACTIVE');

-- --Menu and item
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa sáng'  LIMIT 1),false,'Bữa sáng','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa trưa'  LIMIT 1),false,'Bữa trưa','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Bữa tối'  LIMIT 1),false,'Bữa tối','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Mọi bữa'  LIMIT 1),true,'Combo','ACTIVE');
-- INSERT INTO menu(mealtypeid,isdefault,name,status) VALUES((SELECT id FROM "mealtype" WHERE status = 'ACTIVE' AND name = 'Mọi bữa'  LIMIT 1),false,'Món kèm','ACTIVE');

-- --Món Khai vị
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Rau củ tổng hợp','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Rau%20c%E1%BB%A7%20t%C3%B4ng%20h%E1%BB%A3p%2069.jpg?alt=media&token=b99762bd-e276-424d-b192-1a69db339c5e');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Ngô ngọt','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ng%C3%B4%20ng%E1%BB%8Dt.jpg?alt=media&token=0f1e3a6b-d932-4f3c-a9ef-5d40343b283a');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Đậu bắp nhật','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Dau_Bap_Nhat_20.jpg?alt=media&token=11801572-3863-4eb6-aaf2-8abcb82bd822');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Nấm đùi gà nướng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nam_Dui_Ga_Nuong_39.jpg?alt=media&token=dd984aa1-dee1-4fa8-9638-04ef5f05083a');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Khai vị' LIMIT 1),'Kim Chi cải thảo','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kimchi_Cai_Thao_39.jpg?alt=media&token=5138838d-205c-4753-a341-c8a9df3a913f');

-- -- món kèm: khác
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Canh bò cay','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/canh_Canh%20b%C3%B2%20cay.jpg?alt=media&token=c1e441db-1a6c-4130-ad95-52204533839f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Canh sương bò','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/canh_canh%20s%C6%B0%C6%A1ng%20b%C3%B2%2030k.jpg?alt=media&token=e78dd775-68f7-48a9-a173-bb4a59621470');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Tôm chiên Tartar','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/T%C3%B4m%20chi%C3%AAn%20s%E1%BB%91t%20Tartar%2089.jpg?alt=media&token=7fefe718-5fbb-4c57-a5e5-be88067a071b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Bánh Gyoza chiên','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%C3%A1nh%20chi%C3%AAn%20gyoza.jpg?alt=media&token=8e51f012-eaaf-4691-b665-460075a61006');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Nấm tiên','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/N%E1%BA%A5m%20ti%C3%AAn%2020.jpg?alt=media&token=1b1009f3-45d2-4321-a459-575f67bf3d6d');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Nấm linh chi','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/N%E1%BA%A5m%20linh%20chi%2049.jpg?alt=media&token=ee3a25bc-b414-4bc1-ad7c-1ffa998cc639');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Salad','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Salad%2010.jpg?alt=media&token=46372ac9-bb02-4d5a-9f88-82efe714ed75');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Sushi cá hổi','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Sushi%20c%C3%A1%20%E1%BB%95i%2039.jpg?alt=media&token=4d975061-3b13-4ce5-a132-a82517fef38b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Toboki hải sản','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Toboki%20h%E1%BA%A3i%20s%E1%BA%A3n%20109.jpg?alt=media&token=c10ba834-7662-49b1-a639-be2c4b0bf451');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Mì tôm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/M%C3%AC%20t%C3%B4m%2010.jpg?alt=media&token=809eaa99-11f2-4dd9-b027-c33d22a11067');

-- -- món khác
-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Cơm trộn bò bằm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/C%C6%A1m%20tr%E1%BB%99n%20b%C3%B2%20b%E1%BA%B1m.jpg?alt=media&token=128467ca-f86b-4ead-8a66-107b9ffde74d');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'Cơm rang cá hồi','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/C%C6%A1m%20rang%20c%C3%A1%20h%E1%BB%93i.jpg?alt=media&token=bfdcd556-05d2-4f5e-b75a-c5ffc856a735');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO cơm sườn bò Mỹ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20c%C6%A1m%20s%C6%B0%E1%BB%9Dng%20b%C3%B2%20m%E1%BB%B9.jpg?alt=media&token=e3e531d2-5a49-4a6d-9766-1fc203d4decf');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO mực sốt gừng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20c%C6%A1m%20m%E1%BB%B1c%20s%E1%BB%91t%20g%E1%BB%ABng.jpg?alt=media&token=39a7698d-c7d2-4b8b-a6ea-a5dd820e43a4');


-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Trái cây theo mùa','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Trai%20cay%20theo%20mua%2049k.jpg?alt=media&token=a146a77f-b044-4b8a-a41a-e868357a017c');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem chocolate','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20chocola.jpg?alt=media&token=72e7dac4-91c7-4c0e-900a-9e50882ab694');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem vani','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20vani.jpg?alt=media&token=7d494aef-250d-445b-b92d-2faa93840a07');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem dâu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem%20dau.jpg?alt=media&token=3dc4d391-413e-487d-85d5-6e64b78a6d65');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Kem khoai môn','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Kem_Khoai_Mon.jpg?alt=media&token=5526ae96-71d0-4e5b-bf19-8a2fbe4d4562');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Chè khúc bạch','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ch%C3%A8%20kh%C3%BAc%20b%E1%BA%A1ch.jpg?alt=media&token=b0e7c0c9-b5fb-42a1-b45b-ac47431223e6');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'Trà và bánh bạc hà','ACTIVE',
-- 												 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Tr%C3%A1ng%20mi%E1%BB%87ng%20tr%C3%A0%20v%C3%A0%20b%C3%A1nh%20b%E1%BA%A1c%20h%C3%A0%2059.jpg?alt=media&token=5ea124d3-0e2a-481a-9e50-fb801d45efa1');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Uyên Ương Lẩu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Uy%C3%AAn%20%C6%AF%C6%A1ng%20L%E1%BA%A9u%20225%20.jpg?alt=media&token=4c10ab4c-1910-46fb-b810-018b77701032');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu Nhúng bò Mỹ','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20nh%C3%BAng%20b%C3%B2%20m%E1%BB%B9%20150.jpg?alt=media&token=7422eb17-74c7-4838-8934-6287ed7fb472');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu rau HongKong','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20rau%20hongkong%20150.jpg?alt=media&token=b4d2d47c-e53f-4753-b151-6faa2910353a');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu rau nấm tổng hợp','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Rau_Nam_Tong_Hop_Kem_Lau_59.jpg?alt=media&token=8ae78bb1-880d-4310-a652-cc1a076fe1df');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu mực nhỏ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/lau%20muc%20nh%E1%BB%8F.jpg?alt=media&token=0661e55f-5f56-4691-8595-7697043d0368');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'Lẩu Miso Kim Chi','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/lau%20miso%20kimchi.jpg?alt=media&token=443870f0-3377-45d2-a9aa-abab0cbf79cc');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bò angus','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/bo-angus%20109.jpg?alt=media&token=9aeda456-1a24-486e-8114-a509aa5988c4');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn non obothan','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/S%C6%B0%E1%BB%9Dn%20non%20obathan%20209.jpg?alt=media&token=ab3e910e-e0fc-4734-83aa-cf66f34cac7e');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn gali','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/s%C6%B0%E1%BB%9Dn%20Galbi_109.jpg?alt=media&token=0baf56a7-414f-4bfc-83f2-00f8e1c2820e');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Sườn mật ong','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/s%C6%B0%E1%BB%9Dn%20m%E1%BA%ADt%20ong%20109.jpg?alt=media&token=7737a7cc-e3d3-4e97-8b54-59d0be2f7c35');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bò và heo thượng hạng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%C3%B2%20v%C3%A0%20heo%20th%C6%B0%E1%BB%A3ng%20h%E1%BA%A1ng.jpg?alt=media&token=34b98ee2-6513-4a45-9d94-8ba9986de106');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Má heo tươi tryền thống','ACTIVE', 
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/ma%20heo%20t%C6%B0%C6%A1i%20truy%E1%BB%81n%20th%E1%BB%91ng.jpg?alt=media&token=1c0d66dd-8230-4ecd-82e1-b277c3b1f981');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Heo nạt phủ sốt đậu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Heo%20n%E1%BA%A1t%20ph%E1%BB%A7%20s%E1%BB%91t%20%C4%91%E1%BA%ADu.jpg?alt=media&token=6962cccd-4096-4682-bf3e-8be442fa38f5');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Bụng bò đơn','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%E1%BB%A5ng%20b%C3%B2%20t%C6%B0%E1%BB%9Di%20%C4%91%C6%A1n%2040.jpg?alt=media&token=955be59f-e085-4363-939d-d52c5c6ea59c');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Tôm nướng (10 xiên)','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/T%C3%B4m%20n%C6%B0%E1%BB%9Bng%2010.jpg?alt=media&token=9cd99f33-8f8b-483d-b225-8da0f679445f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu thái thập cẩm','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20l%E1%BA%A9u%20th%C3%A1i%20th%E1%BA%ADp%20c%E1%BA%A9m%20399.jpg?alt=media&token=ff109e32-02a5-42a1-a31e-de3b758fd6bf');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu thái bò sụn','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20th%C3%A1i%20b%C3%B2%20s%E1%BB%A5n-6-10.%20790png.jpg?alt=media&token=6941afc6-0ea4-4364-919e-67a20c177b97');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu riêu ba chỉ bò Mỹ','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20ri%C3%AAu-ba-ch%E1%BB%89-b%C3%B2-m%E1%BB%B9-ss-4-6ng%20590.jpg?alt=media&token=6cd59e89-8c67-4f78-a6ef-114986a75069');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO Kim Chi hải sản','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/L%E1%BA%A9u%20kim%20chi%20h%E1%BA%A3i%20s%E1%BA%A3n%20490.jpg?alt=media&token=582c4f8c-d83d-40d2-a2c6-b522ca8c8df9');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'COMBO bò nướng cổ điển','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20b%C3%B2%20n%C6%B0%E1%BB%9Bng%20c%E1%BB%95%20%C4%91i%E1%BB%83n%20199.jpg?alt=media&token=624ce4ae-7d62-4185-8a94-2aac341f6d43');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'COMBO nướng thượng hàng','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/B%C3%B2%20v%C3%A0%20heo%20th%C6%B0%E1%BB%A3ng%20h%E1%BA%A1ng.jpg?alt=media&token=34b98ee2-6513-4a45-9d94-8ba9986de106');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'COMBO kem ly Hàn Quốc','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20kem%20tr%C3%A1ng%20mi%E1%BB%87ng%203%20ng%C6%B0%E1%BB%9Di%20HQ%20180.jpg?alt=media&token=f7b7cab8-1ec3-4b79-9a46-d47e28f35c10');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Tráng miệng' LIMIT 1),'COMBO bánh kem mini Hàn Quốc','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Combo%20kem%20tr%C3%A1ng%20mi%E1%BB%87ng%203%20ng%C6%B0%E1%BB%9Di%20HQ%20180.jpg?alt=media&token=f7b7cab8-1ec3-4b79-9a46-d47e28f35c10');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món khác' LIMIT 1),'COMBO thịt bò và tôm mini','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/COMBO%20khai%20v%E1%BB%8B%20th%E1%BB%8Bt%20b%C3%B2%20v%C3%A0%20t%C3%B4m%20mini%20.jpg?alt=media&token=ff3d1303-b3c3-4bb3-8414-00b2fcc57c2e');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món lẩu' LIMIT 1),'COMBO lẩu hải sản 1 người','ACTIVE', 
-- 														 'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/COMBO%20l%E1%BA%A9u%201%20h%E1%BA%A3i%20s%E1%BA%A3n%201%20ng%C6%B0%E1%BB%9Di.jpg?alt=media&token=46fd91cf-bc55-417e-a78b-59aae407c864');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước Dasani','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nuoc%20dasani.jpg?alt=media&token=46e691cf-980a-4ada-be9d-965933507004');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ngọt Fanta','ACTIVE'
-- 														,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Fanta.jpg?alt=media&token=c9a965ad-92cd-40b9-90f4-f1206bc84a82');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ngọt soda chanh đường','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Soda_Chanh_Duong_1_3.jpg?alt=media&token=cbbb4eb2-ff5c-420d-b596-98217409fc5f');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ép tropical bạc hà','ACTIVE',
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Tropical_Teapot_Vi_Bac_Ha_1_1.jpg?alt=media&token=ab207d66-319a-4dee-a59f-e92625359154');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Nước ép dưa hấu','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Nuoc_Ep_Dua_Hau_1_1.jpg?alt=media&token=cfbdacc4-93ae-41c7-af07-48e750815f33');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Strong Bow Golden Apple','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Strongbow_Gold_Apple_1_1.jpg?alt=media&token=bca3e48b-9e03-4b0d-9bdf-df9db6b5fff5');

-- INSERT INTO item(majorgroupid,name,status, image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Tiger Crystal','ACTIVE', 
-- 														'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Tiger%20Crystal.jpg?alt=media&token=dda71e80-02d7-4c66-b048-d45e63d70fbc');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Tiger','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Tiger.jpg?alt=media&token=4495b567-d4f5-458e-b2e5-b9db0dbb04cc');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Bia Heineken','ACTIVE'
-- 														,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Bia%20Heineken.jpg?alt=media&token=589c364d-e90a-4711-9eae-e23c650a752b');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Rượu vang đỏ Vina Maipo','ACTIVE'
-- 													   ,'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/Ruou_Vang_Do_Vina_Maipo_Cabernet_Sauvignon_1_1.jpg?alt=media&token=f9fcb3cf-d5b8-4f41-b57e-4d091f9c0711');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Nước uống' LIMIT 1),'Rượu vang trắng Legende','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/R%E1%BB%B1u%20Vang%20Tr%E1%BA%AFng%20Legende.jpg?alt=media&token=8b40c39b-e5d4-4167-a81e-e349f51b93ed');

-- INSERT INTO item(majorgroupid,name,status,image) VALUES((SELECT id FROM "majorgroup" WHERE status = 'ACTIVE' AND name = 'Món nướng' LIMIT 1),'Xiêng xông khói','ACTIVE',
-- 													   'https://firebasestorage.googleapis.com/v0/b/pos-restaurant-30dcc.appspot.com/o/xi%C3%AAng%20x%C3%B4ng%20kh%C3%B3i.jpg?alt=media&token=a708862a-d0b3-46f3-829b-7374a74d4b5c');

-- --Menu item bữa sáng
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 12000);
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),49000);
-- --Món nướng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 49000);												 
-- -- Tráng miệng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Chè khúc bạch' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1),39000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trà và bánh bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);	
-- --Nước uống
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);		

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 59000);

-- --Món khác										 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa sáng' LIMIT 1), 10000);

-- --Menu item bữa trưa
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Đậu bắp nhật' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm đùi gà nướng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Nhúng bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Miso Kim Chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),49000);
-- --Món nướng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn gali' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn mật ong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),69000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 49000);													 
-- --Tráng miệng
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trái cây theo mùa' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
																						 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem dâu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem khoai môn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1),29000);
-- --Nước uống												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép tropical bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép dưa hấu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger Crystal' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 59000);
-- --Món khác
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 10000);
												 
-- --Menu item bữa tối
-- --Khai vị
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rau củ tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Ngô ngọt' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 12000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Đậu bắp nhật' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm đùi gà nướng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kim Chi cải thảo' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);											 												 												
-- --Món lẩu
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Uyên Ương Lẩu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa trưa' LIMIT 1), 39000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Nhúng bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau HongKong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu rau nấm tổng hợp' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu mực nhỏ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Lẩu Miso Kim Chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),49000);
												 
-- --Món nướng												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò angus' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn non obothan' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn gali' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sườn mật ong' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),69000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bò và heo thượng hạng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 109000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Má heo tươi tryền thống' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Heo nạt phủ sốt đậu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bụng bò đơn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 49000);	
-- --Tráng miệng												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trái cây theo mùa' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem chocolate' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem vani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
																						 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem dâu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Kem khoai môn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Chè khúc bạch' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1),39000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Trà và bánh bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);												 
-- --Nước uống												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước Dasani' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt Fanta' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ngọt soda chanh đường' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép tropical bạc hà' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 39000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nước ép dưa hấu' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 29000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Strong Bow Golden Apple' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger Crystal' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Tiger' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);	

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bia Heineken' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rượu vang đỏ Vina Maipo' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 799000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Rượu vang trắng Legende' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 899000);

-- --Món khác
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm trộn bò bằm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Cơm rang cá hồi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Bữa tối' LIMIT 1), 10000);			

-- --Món kèm
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Canh bò cay' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 39000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Canh sương bò' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 39000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Tôm chiên Tartar' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Bánh Gyoza chiên' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 19000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Sushi cá hổi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 29000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm linh chi' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 35000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Nấm tiên' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 25000);	
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Salad' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 10000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Mì tôm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 3000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'Toboki hải sản' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Món kèm' LIMIT 1), 19000);
												 
												 												 												 
-- --Combo													 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu thái thập cẩm' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 399000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu thái bò sụn' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 799000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu riêu ba chỉ bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 599000);												 
												 											 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO Kim Chi hải sản' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 499000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO nướng thượng hàng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1),699000);												 
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO kem ly Hàn Quốc' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1),189000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO bánh kem mini Hàn Quốc' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 209000);												 

-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO thịt bò và tôm mini' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 59000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO lẩu hải sản 1 người' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 99000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO cơm sườn bò Mỹ' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 189000);
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO mực sốt gừng' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 189000);		
												 
-- INSERT INTO menuitem(itemid,menuid,price) VALUES((SELECT id FROM "item" WHERE status = 'ACTIVE' AND name = 'COMBO bò nướng cổ điển' LIMIT 1), 
-- 												 (SELECT id FROM "menu" WHERE status = 'ACTIVE' AND name = 'Combo' LIMIT 1), 189000);													 
-- --voidreason
-- INSERT INTO voidreason("name",status) VALUES('Khách hủy món','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Lỗi nhân viên','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Lỗi hệ thống','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Hết hàng','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Nhầm món ăn hoặc số lượng','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Chuyển món sai','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Món không theo yêu cầu khách','ACTIVE');
-- INSERT INTO voidreason("name",status) VALUES('Nguyên nhân khác','ACTIVE');

-- INSERT INTO paymentmethod("name",status) VALUES('Tiền mặt','ACTIVE');
-- INSERT INTO paymentmethod("name",status) VALUES('MoMo','ACTIVE');
-- INSERT INTO paymentmethod("name",status) VALUES('Séc ngân hàng','ACTIVE');
