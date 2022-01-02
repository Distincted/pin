# pin
pin Indexeddb

example

var database: {
		name: 'name_of_object_store',
		version: 1,
		obj:{
			user:{
				type:{
					keyPath:'id_user', autoIncrement: true // autoIncrement ALWAYS USE TRUE
				},
				index:[
					['email','email',  {unique: true  }],
					['pass','pass',  {unique: true  }],
					['isSave','isSave',  {unique: false  }],
				]
			},
			token:{
				type:{
					keyPath:'id_tok', autoIncrement: true // autoIncrement ALWAYS USE TRUE
				},
				index:[
					['login_token','login_token',  {unique: true  }],
					['x_auth_sign','x_auth_sign',  {unique: true  }]
				]
			}
}

pin.construct(database);

# Select All
pin.selectAll('user').then(function(res){
 // SELECT * FROM USER
   console.log(res,'res');
});


# Select 
pin.selectAll('user',{email:'abcd@gmail.com', pass:'123' },'and').then(function(res){
  // Select * from user where email='abcd@gmail.com' and pass = '123')
   console.log(res,'res');
});

# Insert 
pin.insert('user',{email:'abcd@gmail.com', pass:'123' }).then(function(res){
  // INSERT INTO user ('email','pass') VALUES ('abcd@gmail.com' ,'123')
   console.log(res,'res');
});

# Update 
pin.update('user',{email:'qwerty@gmail.com', pass:'123' },{id_user: 1, email:'abcd@gmail.com'}, 'and' ).then(function(res){
  // UPTADE  user SET email='qwerty@gmail.com' and pass = '123' WHERE id_user=1 and email = 'abcd@gmail.com'
   console.log(res,'res');
});

# Delete 
pin.delete('user',{email:'qwerty@gmail.com', pass:'123' }, 'or' ).then(function(res){
  // DELETE FROM user WHERE email='abcd@gmail.com' or id_user=1
   console.log(res,'res');
});

# Clear
pin.clear('user').then(function(res){
  
});
