/* pin indexeddb version: 1.0.004
*
*/


/*
	debug
	$scope.pin.create({
		name:'__MONITOR__',
		version:1,
		objstores:{
		id:'id_os',
		name_os:'name_os', // databases
		hash_os:'hash_os', // tables
		version_os:'version_os'
		}
		}).then((db)=>{
		$scope.pin.selectAll('objstores').then(function(res){
		vv(JSON.parse(res[0].hash_os),'res')
		})

		});


*/
pin = {
	database:null,
	construct(dbs=null){
		return new Promise((resolve, reject)=>{
			vv(dbs, ' dbs ')
			let new_dbs = $.extend({}, dbs);
		//	this.track(dbs);
			this.track(new_dbs).then((result)=>{
			//	this.database = result;
			//	vv(result,'result aqui RESULT')
				this.database = this.generate_db(result);
			//	vv(this.database, ' this.database ')

			//7	this.database = this.generate_db(dbs);
				this._get_db().then((db)=>{
					var dbs_update;
					if(this._testando == undefined){
						dbs_update = { version_os: dbs.version};
					}else{
						this._testando = undefined;
						dbs_update = {version_os: dbs.version, hash_os: JSON.stringify(dbs)};

					}
					
					//	this._temp = undefined;

						this.create({
							name:'__MONITOR__',
							version:1,
							objstores:{
								id:'id_os',
								name_os:'name_os', // databases
								hash_os:'hash_os', // tables
								version_os:'version_os'
							}
						}).then((db)=>{
							/*
							this.update('objstores',dbs_update, {name_os:dbs.name}).then((updId)=>{
								vv('creadooooouuu')
								this.create(dbs)
								resolve(db);
							});
							*/
								this.create(dbs).then((db)=>{
									resolve(db);

								});

						});
					
				}).catch((err)=>{
				//	alert();
					vv(this._testando, 'VERSÃO ERRADA no Construct 1');
					if( typeof this._testando=='undefined'){

						if( !confirm("Houve um Erro. Gostaria que nós tente corrigir ?")){
							return false;
						}
						this._testando = parseInt(prompt('Digite o Total de tentativas',5))
					}
					dbs['version'] = dbs.version+1;
					setTimeout(()=>{
						this._testando -= 1;
						if( this._testando == 0){
							this._testando = undefined;

						//	return false;
						}
						resolve(
							this.construct(dbs)
						)
					},500)
				});

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
	create(dbs){
		return new Promise((resolve, reject)=>{
			let new_dbs = $.extend({}, dbs);
		//	vv(this.generate_db(new_dbs), 'this.generate_db(new_dbs)')
		//	this.database = this.generate_db(new_dbs);
		//	vv(dbs,'dbs ')
		//	vv(new_dbs,'new_dbs');
		//	vv(this.database,'this.database');

			this.database = this.generate_db(new_dbs);
		//	this.database = new_dbs;
			vv(dbs ,'dbs create(dbs)')
			this._get_db().then((db)=>{
				var dbs_update;
				if(this._testando == undefined){
					dbs_update = { version_os: dbs.version};
				}else{
					this._testando = undefined;
					dbs_update = {version_os: dbs.version, hash_os: JSON.stringify(dbs)};

				}
				if(typeof this._temp == 'undefined'){
					resolve( db );
				}else{
					this._temp = undefined;

					this.create({
						name:'__MONITOR__',
						version:1,
						objstores:{
							id:'id_os',
							name_os:'name_os', // databases
							hash_os:'hash_os', // tables
							version_os:'version_os'
						}
					}).then((db)=>{
					//	this.update('objstores',{version_os: dbs.version }, {name_os:dbs.name}).then((updId)=>{
						this.update('objstores',dbs_update, {name_os:dbs.name}).then((updId)=>{
						
							vv('creadooooouuu')
							this.create(dbs)
							resolve(db);
						});
					});
				}
			}).catch((err)=>{
				this._temp = true;
				vv('VERSÃO ERRADA no create 2');
				if(isNaN(dbs.version)){
					dbs['version'] = 1;
				}
				dbs['version'] = dbs.version+1;
			//	vv(this._testando, 'VERSÃO ERRADA 1');
				if( typeof this._testando=='undefined' || undefined == this._testando ){

					if( !confirm("Houve um Erro. Gostaria que nós tente corrigir ?")){
						return false;
					}
					this._testando = parseInt(prompt('Digite o Total de tentativas',5))
				}

				setTimeout(()=>{
					this._testando -= 1;
					if( this._testando == 0){
						this._testando = undefined;
					}
					resolve(
						this.create(dbs)
					)
				},500)
			});

		});

	},
	track( obj ){
		vv(obj,'Traqueie o obj')
		/*
		track({
			name:'db_testando',
			user:{
				id:'id_ts'
				etc:'etc'
			}
		});
		*/
		return new Promise((resolves, reject)=>{
			var ant_os = $.extend({}, this.database );

			(()=>{
				return new Promise((resolve, reject)=>{

					this.create({
						name:'__MONITOR__',
						version:1,
						objstores:{
							id:'id_os',
							name_os:'name_os', // databases
							hash_os:'hash_os', // tables
							version_os:'version_os'
						}
					}).then((db)=>{
						this.select('objstores',{name_os: obj.name }).then((res)=>{
							vv(res,'res aqui')
							if(res==null || res.length == 0 ){

							
								this.insert('objstores',{
									name_os: obj.name, 
									hash_os: JSON.stringify( obj ), 
									version_os: 1,
								}).then((idOS)=>{
									obj['version'] = 1;
									vv('REJECT');
									resolve(obj);
								});
							}else{
								function objectEquals(x, y) {
									if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
									if (x.constructor !== y.constructor) { return false; }
									if (x instanceof Function) { return x === y; }
									if (x instanceof RegExp) { return x === y; }
									if (x === y || x.valueOf() === y.valueOf()) { return true; }
									if (Array.isArray(x) && x.length !== y.length) { return false; }
									if (x instanceof Date) { return false; }
									if (!(x instanceof Object)) { return false; }
									if (!(y instanceof Object)) { return false; }
									var p = Object.keys(x);
									return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
									p.every(function (i) { return objectEquals(x[i], y[i]); });
								}

								var obj_antigo = JSON.parse( res[0].hash_os );

								var update = true;
								var obj_novo;
								if( Object.keys(obj).length > Object.keys(obj_antigo).length ){
									// atualize
									obj_novo = $.extend(obj, obj_antigo);
									update = true;
								}else{
									// Atualize só se os objetos internos(obj_antigo) for diferente 
									
									

									// se no objeto que veio tiver algum propriedade diferente então atualize
									var keys_obj = Object.keys(obj);
									for( let i in keys_obj ){
										if(!obj_antigo.hasOwnProperty(keys_obj[i])  ){
											vv()
											update = false;
										}
									}
								//	obj_novo = $.extend(obj_antigo, obj);
									obj_novo = $.extend(obj, obj_antigo);
									if( objectEquals( obj_novo, obj_antigo ) ){
										vv('<----- IGUAL NÃO ATUALIZE')
										update = false;
									}else{
										vv('<----- DIFERENTE ATUALIZE')

										update = true;
									}


								}
								if( obj.version == null){
									obj.version = 1;
								}
								if( obj_antigo.version == null){
									obj_antigo.version = 1;
								}
								vv(obj,'obj Inicio');

								vv(update,'UPDATE OR NO??');
								vv(obj_antigo,'obj_antigo ');
								vv(obj_novo,'obj_novo Final');
								if(update){
									var obj3 = $.extend(obj_antigo, obj);
									let version = parseInt(obj_antigo.version) + 1;
									obj3['version'] = parseInt(obj_antigo.version) + 1;
									vv(' UPDATE DO objstores no banco de dados')
	//resolve(obj3); return false; vv('FALSO UPDATE DO objstores no banco de dados')
									this.update('objstores',{version_os: version, hash_os: JSON.stringify(obj3) },{id_os: res[0].id_os }).then((uptd)=>{
										vv(uptd, 'UPDATE objstores __MONITOR__ AGORA')
										resolve( obj3 );

									});
								//	resolve(  );

								}else{

									resolve(obj_antigo );

								}
								

							}
						}).catch((err)=>{

						});

					});
				});

			})().then((obj3)=>{
				vv(obj3,'??? obj3 ???');
				this.create(obj3).then((db)=>{
					resolves(obj3);
				});

			//	});
			}).catch((obj)=>{
				resolves( obj );
			});
		});
	},
	handlerDB(){
		function create(){
			return new Promise((resolve, reject)=>{
				this._get_db().then((db)=>{
					const db_name = db.name;
					const db_version = db.version;
					this.getNameOS().then((arr_dbs)=>{
						var arr_existent = [];
						var not_included = [];
						$for(function(v,k){
							arr_existent.push(k);
							if(!arr_dbs.includes(k) ){
								not_included.push(k);
							} 
						}, this.database.obj );
						vv(arr_existent,'arr_existent handlerDB');
						vv(arr_dbs,'arr_dbs handlerDB');
						vv(not_included,'not_included handlerDB');

					});
					

					


				});
			});
		}
		create = create.bind(this);
		create();

	},
	generate_db( db_arr ){
		let arr = $.extend({}, db_arr);
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
						resolve(null);						
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
	delete(name_db, where, orAnd='and'){
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
	clear(table ){
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
	truncate( name_db ){
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
	}
}
