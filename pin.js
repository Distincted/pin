/* NEW VERSION
*  Pindexeddbb.js 2.0.0003
*	29/01/2021
*
*/

/*
if (!window.indexedDB) {
	window.alert("Seu navegador não suporta Alguns recursos.");
}

database = {
	name: 'pin',
	version: 1,
	obj:{
		user:{
			val: {
				keyPath: 'id_pin', autoIncrement: true
			},
			index:[
			//	['id_user', 'id_user',{unique: true, multiEntry: false}],
			//	['pass','pass',{unique: false,multiEntry: false}],
				['email','email',{unique: true, multiEntry: true}]
			]
		}
	}
}
*/

//var locals = '';
 pin = {
//	abs:'model',
	database:null,
	construct(){
		locals = $scope.pin;
	//	locals = pin;
		this.database = {
			name: 'pin',
			version: 2,
			obj:{
				user:{
					val: {
						keyPath: 'id_pin', autoIncrement: true
					},
					index:[
					//	['id_user', 'id_user',{unique: true, multiEntry: false}],
					//	['pass','pass',{unique: false,multiEntry: false}],
						['email','email',{unique: false, multiEntry: true}]
					]
				}
			}
		}
	},
	_get_db(){
		return new Promise((resolve, reject)=>{
			try{
				const nameStore = this.database.name;
				let db;
				let dbReq = indexedDB.open( nameStore , this.database.version, (upgradeDb)=>{
					console.log('Criando Banco');
					let db_obj = this.database.obj;
					let aux;
					for(let dat in db_obj ){
						aux = db_obj.obg[dat]['createIndex'];
						delete db_obj.obg[dat]['createIndex'];
						if (!upgradeDb.objectStoreNames.contains( dat )) {
							upgradeDb.createObjectStore( dat , db_obj[dat] );
						}
					}
				});

				dbReq.onupgradeneeded = (event)=>{
					upgradeDb = event.target.result;
					console.log( 'Atualizando Banco');
					let db_obj = this.database.obj;
					let aux;
					var upgradeTransaction = event.target.transaction;
					var objectStore;
					for(let dat in db_obj ){
						if( typeof db_obj[dat]['index'] == 'undefined'){

						}else{
							aux =  db_obj[dat]['index'];
						}
						delete db_obj[dat]['index'];
						if (!upgradeDb.objectStoreNames.contains(dat)) {
							objectStore = upgradeDb.createObjectStore(dat, db_obj[dat].val );
							if(typeof objectStore != 'undefined'){
								for(let i in aux){
									objectStore.createIndex( ...aux[i] );
								}
							}
						} else {
							objectStore = upgradeTransaction.objectStore(dat, db_obj[dat] );
						}
					}
				}
				dbReq.onsuccess = function(event) {
					db = event.target.result;
					resolve(db);
				}
				dbReq.onerror = function(event) {
					alert('error opening database ' + event.target.errorCode);
					reject(event.target.errorCode);
				}
			}catch(err){
				reject(err);
			}
		});
	},
	_filter(arr, where, orAnd='and'){
		let result= arr.filter(function(item) {
			for (var ky in where){
				if(orAnd=='and'){
					if (item[ky] === undefined || item[ky] != where[ky]){
						return false;
					}
				}else if(orAnd=='or'){
					if (item[ky] === undefined || item[ky] == where[ky] ){
						return true;
					}				
				}
			}
			if( orAnd == 'and'){
				return true;
			}else if(orAnd =='or'){
				return false;
			}
		});
		return result;
	},
	insert(name_db, value){
		return new Promise((resolve, reject)=>{

			this._get_db( name_db ).then( (db)=>{
				addStickyNote(db, value, name_db).then((end)=>{
					db.close();
					resolve(end);
				}).catch((err)=>{
					db.close();
					reject(err);
				});
			});
			function addStickyNote(db, values, name_db) {
				return new Promise((resolve, reject)=>{
					let request = db.transaction([name_db], 'readwrite');
					let store = request.objectStore(name_db);
					let note = values;
					var key_val;
					try{
						 key_val = store.add(note);
					}catch(e){
						resolve(0);
					}
					key_val.onsuccess = function(event){
						values[key_val.source.keyPath] = key_val.result;
						resolve( [values] );
					};
					request.oncomplete = function() { 
						resolve( [values] );
					}
					request.onerror = function(event) {
						reject(event.target.error.message);
					}
				});
			}
		});
	},
	select(name_db, where, orAnd ){
		return new Promise((resolve, reject)=>{

			this._get_db( name_db ).then( (db)=>{
				getting(db, where, name_db, orAnd).then((end)=>{
					db.close();
					resolve(end);
				}).catch((res)=>{
					reject(res);
				});
			});
			
			function getting(db, where, name_db, orAnd){
				return new Promise((resolve, reject)=>{
					let tx = db.transaction([name_db], 'readwrite');
					let store = tx.objectStore(name_db);
					var request = store.openCursor();
					
					request.onsuccess = (function(event){
						let res = store.getAll();
						res.onsuccess = (function() {
							let aY = this._filter(res.result, where, orAnd );
							resolve( aY );
						}).bind( locals );
					}).bind( locals );


					request.onerror = function(ev){
						reject(ev);
					};
				});
			}
		});
	},
	selectAll(name_db){
		return new Promise((resolve, reject)=>{

			this._get_db( name_db ).then( (db)=>{
				//	console.log('ccccccccccc')
				getting(db, name_db).then((end)=>{
					db.close();
					resolve(end);
				});
			});
			function getting(db, name_db){
				return new Promise((resolve, reject)=>{

					let tx = db.transaction([name_db], 'readwrite');
					let store = tx.objectStore(name_db); 
					var request = store.openCursor();
					request.onsuccess = function(event){
						let res = store.getAll();
						res.onsuccess = function() {
							resolve( res.result );
						};
					};
					request.onerror = function(ev){
						reject(ev);
					};
				});
			}
		});
	},
	update(name_db, values, where, orAnd='and'){
		return new Promise((resolve, reject)=>{
			this._get_db( name_db).then( (db)=>{
				updating(db, where, orAnd, values, name_db).then((end)=>{
					db.close();
					resolve(end);
				});
			});
			function updating(db, where, orAnd, values, name_db ){
				return new Promise((resolve, reject)=>{
					let tx = db.transaction([name_db], 'readwrite');
					let store = tx.objectStore(name_db); 
					var res = store.getAll();
					res.onsuccess = function(event) {
						var result;
						var arr={};
						result = pin._filter(event.target.result, where, orAnd );
						
						if(result.length==0){
							resolve([]);
							return false;
						}
						for(let i in values ){
							result[0][i] = values[i];
						}
						var update_store = store.put(result[0] );
						update_store.onsuccess = function(){
							resolve( [ result[0] ] );
						};
					};			
				});
			}
		});
	},
	delete(name_db, where, orAnd='and'){
		return new Promise((resolve, reject)=>{
			if(orAnd != 'and' && orAnd != 'or'){
				orAnd = 'and';
			}
			this._get_db( name_db).then( (db)=>{
				delete_db(db, where, name_db, orAnd ).then((end)=>{
					db.close();
					resolve(end);
				});
			});
		});	
		function delete_db( db, where, name_db, orAnd ){
			return new Promise((resolve, reject)=>{
				let tx = db.transaction([name_db], 'readwrite');
				let store = tx.objectStore(name_db); 

				var res = store.getAll();
				res.onsuccess = function(event) {
					var fresult;
					var arr={};
					fresult = pin._filter(event.target.result, where, orAnd );
					event.target.result = fresult;
					keyIndex = event.target.source.keyPath;
					if(fresult.length==0){
						resolve([0]);
					}else{
						for(let r in fresult){
							var update_store = store.delete( fresult[ r ][  keyIndex  ] );
						}
						update_store.onsuccess = function(){
							resolve([1]);
						};
					}
					return false;
				};			
			});
		}
	},
	clear(){

	}
}

