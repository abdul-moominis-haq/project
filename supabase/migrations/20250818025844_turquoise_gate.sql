@@ .. @@
 -- Enable Row Level Security
-ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
+ALTER DATABASE postgres SET "app.jwt_secret" TO 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZnVzYW9qd2FvaXVrYmJibmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTE2NDksImV4cCI6MjA3MDk2NzY0OX0.3WXfbNvpnop8_LHHCxVHDMDFVs6b7Yk3G9zOQKMXg08';
 
 -- Create profiles table (extends auth.users)