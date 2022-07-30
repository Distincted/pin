pin = {
	/* pin indexeddb version: 1.0.004
*
*/
	database:null,
	async construct(dbs=null){
	//	vv(dbs, ' dbs construct PIN')
		return new Promise((resolve, reject)=>{
			
			var new_dbs;
			if( typeof dbs =='function'){
				new_dbs =dbs();
			}else{
				new_dbs = dbs;
			}

			this.database = this.generate_db(new_dbs);
			this._get_db().then((db)=>{
				resolve(db);
			});

		});
	},
	getNameOS(){
		return new Promise((resolve, reject)=>{
			this._get_db().then((db)=>{
				var arr_dbs = [];
				$for(function(v,k){
					if( typeof v == 'string'){
						arr_dbs.push(v);
					}
				}, db.objectStoreNames );
				resolve(arr_dbs);
			});
		});
	},
	
	
	generate_db( db_arr ){
		let arr = Object.assign({}, db_arr);
		var name = arr.name;
		var version = arr.version;

		delete arr.name;
		delete arr.version;


		var new_obj = {name: name, version: version, obj:{} };

		for(let i in arr ){
			var index = [];
			for(let ii in arr[i] ){
				if(ii!='id'){
					if( typeof arr[i][ii] == 'string' ){
						index.push([arr[i][ii], arr[i][ii], {unique: false }])
					}else{
						index.push([
							ii, 
							ii, 
							((typeof arr[i][ii][1] !='undefined')?(arr[i][ii][1]):({ unique: false} )) 
						])

					}
				}
			}
		//	vv(index,'index')
			new_obj.obj[i] = {
				type:{
					keyPath: arr[i].id, autoIncrement: true
				},
				index: index
			}
		}
		return new_obj;

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
					var upgradeDb = event.target.result;
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
							objectStore = upgradeDb.createObjectStore(dat, db_obj[dat].type );
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
					console.warn('error opening database ' + event.target.errorCode);
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
	async insert(name_db, value){
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
					};
					request.onerror = function(event) {
						reject(event.target.error.message);
					};
				});
			}
		});
	},
	async select(name_db, where, orAnd ){
		return new Promise((resolve, reject)=>{

			function getting(db, where, name_db, orAnd){
				return new Promise((resolve, reject)=>{
					try{
						let tx = db.transaction([name_db], 'readwrite');
						let store = tx.objectStore(name_db);
						var request = store.openCursor();
						
						request.onsuccess = (event)=>{
							let res = store.getAll();
							res.onsuccess = ()=>{
								let aY = this._filter(res.result, where, orAnd );
								resolve( aY );
							}
						}

						request.onerror = function(ev){
							reject(ev);
						};

					}catch(err){
						resolve(new Error(err));						
					}
				});
			}
			getting = getting.bind(this);
			this._get_db( name_db ).then( (db)=>{
				getting(db, where, name_db, orAnd).then((end)=>{
					db.close();
					resolve(end);
				}).catch((res)=>{
					reject(res);
				});
			});
			
		});
	},
	async selectAll(name_db){
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
	async update(name_db, values, where, orAnd='and'){
		return new Promise((resolve, reject)=>{
			function updating(db, where, orAnd, values, name_db ){
				return new Promise((resolve, reject)=>{

					let tx = db.transaction([name_db], 'readwrite');
					let store = tx.objectStore(name_db);
					var request = store.openCursor();

					request.onsuccess = (event)=>{
						let res = store.getAll();
						res.onsuccess = ()=>{
							let result = this._filter(res.result, where, orAnd );
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
						}
					}
				});
			}
			updating = updating.bind(this);

			this._get_db( name_db).then( (db)=>{
				updating(db, where, orAnd, values, name_db).then((end)=>{
					db.close();
					resolve(end);
				});
			});
		});
	},
	async delete(name_db, where, orAnd='and'){
		return new Promise((resolve, reject)=>{
			function delete_db( db, where, name_db, orAnd ){
				return new Promise((resolve, reject)=>{
					
					let tx = db.transaction([name_db], 'readwrite');
					let store = tx.objectStore(name_db);
					var request = store.openCursor();

					request.onsuccess = (event)=>{
						let res = store.getAll();
						res.onsuccess = ()=>{
							let fresult = this._filter(res.result, where, orAnd );
						//	event.target.result = fresult;
							var keyIndex = event.target.source.keyPath;
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
						//	resolve(  );
						}
					}		
				});
			}
			if(orAnd != 'and' && orAnd != 'or'){
				orAnd = 'and';
			}
			delete_db = delete_db.bind(this);
			this._get_db( name_db).then( (db)=>{
				delete_db(db, where, name_db, orAnd ).then((end)=>{
					db.close();
					resolve(end);
				});
			});
		});	
	},
	async clear(table ){
		return new Promise((resolve, reject)=>{
			function clearData(db ) {
				var transaction = db.transaction(["toDoList"], "readwrite");
				transaction.oncomplete = function(event) {
					resolve(1);
				};
				transaction.onerror = function(event) {
					resolve(0);
				};
				var objectStore = transaction.objectStore("toDoList");
				var objectStoreRequest = objectStore.clear();

				objectStoreRequest.onsuccess = function(event) {
					resolve(1);

				};
			}
			clearData = clearData.bind(this);
			this._get_db( table ).then( (db)=>{
				clearData(db ).then((end)=>{
					vv(db,'db aqui pin.js / clear')
					db.close();
					resolve(end);
				});
			});

		});
	},
	async truncate( name_db ){
		return new Promise((resolve, reject)=>{


			function delete_OS( db, name_db ){
				return new Promise(function(resolves, rejects ){
				//	var DBDeleteRequest = db.deleteDatabase(name_db);
					var DBDeleteRequest = window.indexedDB.deleteDatabase(name_db);


					DBDeleteRequest.onerror = function(event) {
						console.log("Error deleting database.");
						resolve(0);
					};

					DBDeleteRequest.onsuccess = function(event) {
						console.log("Database deleted successfully");

						console.log(event.result); // should be undefined
						resolve(1);
					};

				})

			}

			delete_OS = delete_OS.bind(this);
			this._get_db().then( (db)=>{
				vv(db,'db aqui pin.js / clear')
				delete_OS( db, name_db ).then((end)=>{
					db.close();
					resolve(end);
				});
			});

		})
	},
	dynamicSort(property) {
		//	People.sort(dynamicSort("Name"));
		var sortOrder = 1;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a,b) {
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	},
	dynamicSortMultiple() {
		//	People.sort(dynamicSortMultiple("Name", "-Surname"));
		//	https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
		var props = arguments;
		return  (function(obj1, obj2){
			var i = 0, result = 0, numberOfProperties = props.length;
			while(result === 0 && i < numberOfProperties) {
				result = this.dynamicSort(props[i])(obj1, obj2);
				i++;
			}
			return result;
		}).bind(this);
	}
}

