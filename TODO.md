## stuff
- network graphs are going to be specific to groups, which can have users, and users can generate invites for
- groups have owners, can do whatever, groups also have admins (permissions = 1), which can manage stuff but cant kick other admins or wtv, ownership can be transferred
- graphs have same as above

# Frontend:
- Login page
- Registration page
- Home page
> - [ ] View all groups
> - [ ] View latest graphs
- Groups page
> - [ ] Create, update, and delete groups
- Graphs page
> - [ ] Create, updatre, and delete graphs for a group
- Personal page with username and password edit, invites, and other settings
- Network graph page 
> - [ ] Filter by entity
> - [ ] Filter by relationship
> - [ ] Search for entity (includes scanning description) | maybe dw about this
> - [ ] Display graph for selected group

## Backend API:
- Implement JWT authentication on required routes
- Implement permissions on necessary routes
- Complete user route
> - [x] Login
> - [x] Register
> - [ ] Fetch user data
> - [ ] Update user
> - [ ] Delete user
> - [ ] Fetch user invites
- Complete invites route
> - [x] Generate invite
> - [ ] Delete invite
- Complete entity route
- Ensure database structure makes sense
> - Get off of Drizle ORM and just use raw SQL

## Docker:
- Implement docker-compose for all 3 sections of the app: frontend, backend, and database