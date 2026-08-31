-- Keep wealth.profiles.role in sync with advisor admin flags for people
-- who already signed in before is_admin existed.

UPDATE wealth.profiles AS p
   SET role = 'admin'
  FROM wealth.advisors AS a
 WHERE p.advisor_id = a.id
   AND a.is_admin = true
   AND a.is_active = true
   AND p.role <> 'admin';

UPDATE wealth.profiles AS p
   SET role = 'advisor'
  FROM wealth.advisors AS a
 WHERE p.advisor_id = a.id
   AND a.is_admin = false
   AND a.is_active = true
   AND p.role = 'admin';
