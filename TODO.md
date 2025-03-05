## stuff
- network graphs are going to be specific to groups, which can have users, and users can generate invites for
- groups have owners, can do whatever, groups also have admins (permissions = 1), which can manage stuff but cant kick other admins or wtv, ownership can be transferred
- graphs have same as above
- create a default example graph for new users

# Frontend:
- [ ] Login page
> - [ ] Add option to remember user
- [x] Registration page
- [ ] Introduction page
- [ ] Home page
> - [ ] Display 5 most recent graphs (with an all button to view all - redirects to graph page)
> - [ ] View invitations (sent and received)
- [ ] Graphs page
> - [ ] Display all graphs
> - [ ] Create new graph
- [ ] Personal page with username and password edit, invites, and other settings
- [ ] Network graph page 
> - [ ] Filter by entity (name or id)
> - [ ] Filter by relationship (name)
- [ ] Admin section
> - [ ] View and manage all users (ban, delete, assign invite)
> - [ ] View and manage all invites (create, give, delete)
> - [ ] View stats (total graphs, total users, etc)

## Backend API:
- [ ] Implement JWT authentication on required routes
- [ ] Implement permissions on necessary routes
- [ ] Complete user route
> - [x] Login
> - [x] Register
> - [ ] Fetch user data
> - [ ] Update user
> - [ ] Delete user
> - [ ] Fetch user invites
- [ ] Complete invites route
> - [x] Generate invite
> - [ ] Delete invite
- [ ] Complete entity route
- [ ] Ensure database structure makes sense
> - [ ] Get off of Drizle ORM and just use raw SQL

## Docker:
- Implement docker-compose for all 3 sections of the app: frontend, backend, and database