## stuff
- network graphs are going to be specific to groups, which can have users, and users can generate invites for
- groups have owners, can do whatever, groups also have admins (permissions = 1), which can manage stuff but cant kick other admins or wtv, ownership can be transferred
- graphs have same as above
- create a default example graph for new users

REDO THE ENTIRE CODEBASE !! CURSOR CODE MESSY

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
> - [ ] In the users page, make it so users are fetched in batches rather than all to prevent lag on a massive scale

## Backend API:
- [ ] Implement JWT authentication on required routes
- [ ] Implement permissions on necessary routes
- [ ] Complete user route
> - [x] Login
> - [x] Register
> - [x] Fetch user data
> - [ ] Update user
> - [ ] Delete user
> - [x] Fetch user invites
- [ ] Complete invites route
> - [x] Generate invite
> - [x] Delete invite
> - [ ] Fetch invites for specific user id
- [ ] Complete entity route
- [ ] Ensure database structure makes sense
> - [ ] Get off of Drizle ORM and just use raw SQL
- [ ] Bans
> - [ ] Add ban reason and expiration
> - [ ] Make separate modal for banning rather than having it in the overview modal

## Docker:
- Implement docker-compose for all 3 sections of the app: frontend, backend, and database