const { createApp } = Vue;

createApp({
    data() {
        return {
            isAuthenticated: false,
            passwordInput: '',
            passwordError: '',
            isCheckingPassword: false,
            activeTab: 'comptes',
            tabs: [
                { id: 'comptes', label: 'Comptes' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'dettes', label: 'Dettes' }
            ],
            comptes: [],
            personnes: [],
            transactions: [],
            showAddAccountModal: false,
            showAddTransactionModal: false,
            showAddPersonModal: false,
            showAddDebtModal: false,
            editingAccount: null,
            editingTransaction: null,
            editingPerson: null,
            transactionForDebt: null,
            modalClickStartedOnOverlay: false,
            lastDebtPerson: null,
            accountForm: {
                nom: '',
                type: 'banque',
                solde: 0
            },
            transactionForm: {
                date: new Date().toISOString().split('T')[0],
                montant: 0,
                type: 'dépense',
                source: 0,
                destination: 0,
                categorie: '',
                personne: 0,
                description: ''
            },
            personForm: {
                nom: ''
            },
            filterCategorie: '',
            filterType: '',
            filterMonth: '',
            filteredTransactions: []
        };
    },
    computed: {
        totalSolde() {
            return this.comptes.reduce((sum, compte) => sum + compte.solde, 0);
        },
        totalRevenus() {
            return this.transactions
                .filter(t => t.type === 'revenu')
                .reduce((sum, t) => sum + t.montant, 0);
        },
        totalDepenses() {
            return this.transactions
                .filter(t => t.type === 'dépense')
                .reduce((sum, t) => sum + t.montant, 0);
        },
        bilanMensuel() {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthTransactions = this.transactions.filter(t => 
                t.date.startsWith(currentMonth)
            );
            const revenus = monthTransactions
                .filter(t => t.type === 'revenu')
                .reduce((sum, t) => sum + t.montant, 0);
            const depenses = monthTransactions
                .filter(t => t.type === 'dépense')
                .reduce((sum, t) => sum + t.montant, 0);
            return revenus - depenses;
        },
        depensesParCategorie() {
            const depenses = this.transactions.filter(t => t.type === 'dépense');
            const categories = {};
            depenses.forEach(t => {
                categories[t.categorie] = (categories[t.categorie] || 0) + t.montant;
            });
            return categories;
        },
        maxDepenseCategorie() {
            const values = Object.values(this.depensesParCategorie);
            return values.length > 0 ? Math.max(...values) : 1;
        },
        categories() {
            const cats = new Set(this.transactions.map(t => t.categorie).filter(Boolean));
            return Array.from(cats).sort();
        }
    },
    mounted() {
        this.initializePassword();
        this.checkStoredAuth();
    },
    methods: {
        // Authentification
        async initializePassword() {
            const db = typeof window !== 'undefined' ? window.database : (typeof database !== 'undefined' ? database : null);
            if (!db) {
                console.error('❌ Firebase n\'est pas disponible pour l\'authentification.');
                return;
            }

            try {
                // Vérifier si le mot de passe existe dans Firebase
                const snapshot = await db.ref('password').once('value');
                if (!snapshot.exists()) {
                    // Initialiser le mot de passe dans Firebase
                    const defaultPassword = 'YSO2vPKTxsiPlGcD';
                    await db.ref('password').set(defaultPassword);
                    console.log('✅ Mot de passe initialisé dans Firebase');
                }
            } catch (e) {
                console.error('❌ Erreur lors de l\'initialisation du mot de passe:', e);
            }
        },
        async checkPassword() {
            this.passwordError = '';
            this.isCheckingPassword = true;

            const db = typeof window !== 'undefined' ? window.database : (typeof database !== 'undefined' ? database : null);
            if (!db) {
                this.passwordError = 'Firebase n\'est pas disponible.';
                this.isCheckingPassword = false;
                return;
            }

            try {
                const snapshot = await db.ref('password').once('value');
                const storedPassword = snapshot.val();

                if (this.passwordInput === storedPassword) {
                    this.isAuthenticated = true;
                    this.passwordInput = '';
                    // Stocker l'authentification dans sessionStorage
                    sessionStorage.setItem('moneytrack_authenticated', 'true');
                    document.body.classList.add('authenticated');
                    // Cacher l'écran statique
                    const staticLogin = document.getElementById('static-login');
                    if (staticLogin) {
                        staticLogin.style.display = 'none';
                    }
                    // Charger les données après authentification
                    this.loadData();
                    this.filterTransactions();
                } else {
                    this.passwordError = 'Mot de passe incorrect.';
                    this.passwordInput = '';
                }
            } catch (e) {
                console.error('❌ Erreur lors de la vérification du mot de passe:', e);
                this.passwordError = 'Erreur lors de la vérification. Veuillez réessayer.';
            } finally {
                this.isCheckingPassword = false;
            }
        },
        checkStoredAuth() {
            // Vérifier si l'utilisateur est déjà authentifié dans cette session
            const stored = sessionStorage.getItem('moneytrack_authenticated');
            if (stored === 'true') {
                this.isAuthenticated = true;
                document.body.classList.add('authenticated');
                // Cacher l'écran statique
                const staticLogin = document.getElementById('static-login');
                if (staticLogin) {
                    staticLogin.style.display = 'none';
                }
                this.loadData();
                this.filterTransactions();
            }
        },
        logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                this.isAuthenticated = false;
                sessionStorage.removeItem('moneytrack_authenticated');
                this.passwordInput = '';
                this.passwordError = '';
            }
        },

        // Gestion des comptes
        saveAccount() {
            if (this.editingAccount) {
                const index = this.comptes.findIndex(c => c.id === this.editingAccount.id);
                if (index !== -1) {
                    const oldAccount = this.comptes[index];
                    // Si le solde change, mettre à jour le solde initial
                    const soldeInitial = oldAccount.solde !== this.accountForm.solde 
                        ? this.accountForm.solde 
                        : (oldAccount.soldeInitial !== undefined ? oldAccount.soldeInitial : oldAccount.solde);
                    
                    this.comptes[index] = { 
                        ...this.accountForm, 
                        id: this.editingAccount.id,
                        soldeInitial: soldeInitial,
                        solde: this.accountForm.solde
                    };
                    // Recalculer les soldes après modification
                    this.recalculateAccountBalances();
                }
            } else {
                const newId = this.comptes.length > 0 ? Math.max(...this.comptes.map(c => c.id)) + 1 : 1;
                this.comptes.push({ 
                    ...this.accountForm, 
                    id: newId,
                    soldeInitial: this.accountForm.solde,
                    solde: this.accountForm.solde
                });
            }
            this.closeAccountModal();
            this.saveData();
        },
        editAccount(compte) {
            this.editingAccount = compte;
            this.accountForm = { ...compte };
            this.showAddAccountModal = true;
        },
        deleteAccount(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
                this.comptes = this.comptes.filter(c => c.id !== id);
                this.transactions = this.transactions.filter(t => t.source !== id && t.destination !== id);
                this.saveData();
            }
        },
        handleAccountModalOverlayMouseDown(event) {
            // Vérifier si le mousedown a eu lieu sur l'overlay (pas dans la modal)
            if (event.target === event.currentTarget) {
                this.modalClickStartedOnOverlay = true;
            } else {
                this.modalClickStartedOnOverlay = false;
            }
        },
        handleAccountModalOverlayMouseUp(event) {
            // Ne pas fermer si une sélection de texte est en cours
            const selection = window.getSelection();
            const activeElement = document.activeElement;
            const hasTextSelection = selection && selection.toString().length > 0;
            const hasInputSelection = activeElement && 
                (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
                activeElement.selectionStart !== activeElement.selectionEnd;
            
            if (hasTextSelection || hasInputSelection) {
                this.modalClickStartedOnOverlay = false;
                return;
            }
            // Fermer seulement si le clic a commencé ET s'est terminé sur l'overlay
            if (this.modalClickStartedOnOverlay && event.target === event.currentTarget) {
                this.closeAccountModal();
            }
            this.modalClickStartedOnOverlay = false;
        },
        closeAccountModal() {
            this.showAddAccountModal = false;
            this.editingAccount = null;
            this.accountForm = { nom: '', type: 'banque', solde: 0 };
        },
        getAccountTypeLabel(type) {
            const labels = {
                'banque': '🏦 Banque',
                'paypal': '💳 PayPal',
                'revolut': '💳 Revolut',
                'especes': '💵 Espèces'
            };
            return labels[type] || type;
        },
        getAccountName(id) {
            const compte = this.comptes.find(c => c.id === id);
            return compte ? compte.nom : '-';
        },

        // Gestion des transactions
        saveTransaction() {
            if (this.editingTransaction) {
                const oldTransaction = this.transactions.find(t => t.id === this.editingTransaction.id);
                this.revertTransaction(oldTransaction);
                
                const index = this.transactions.findIndex(t => t.id === this.editingTransaction.id);
                if (index !== -1) {
                    // Préserver les propriétés rembourse, valide et dettePersonne lors de l'édition
                    const rembourse = oldTransaction.rembourse || false;
                    const valide = oldTransaction.valide || false;
                    const dettePersonne = oldTransaction.dettePersonne || null;
                    this.transactions[index] = { 
                        ...this.transactionForm, 
                        id: this.editingTransaction.id,
                        rembourse: rembourse,
                        valide: valide,
                        dettePersonne: dettePersonne
                    };
                    this.applyTransaction(this.transactions[index]);
                }
            } else {
                const newId = this.transactions.length > 0 ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
                const transaction = { 
                    ...this.transactionForm, 
                    id: newId,
                    rembourse: false,
                    valide: false,
                    dettePersonne: null
                };
                this.transactions.push(transaction);
                this.applyTransaction(transaction);
                
                // Sauvegarder les valeurs pour le prochain enregistrement
                this.saveLastTransactionValues();
            }
            this.closeTransactionModal();
            this.saveData();
            this.filterTransactions();
        },
        saveLastTransactionValues() {
            // Sauvegarder la date, le type et la catégorie dans localStorage
            const lastValues = {
                date: this.transactionForm.date,
                type: this.transactionForm.type,
                categorie: this.transactionForm.categorie
            };
            localStorage.setItem('moneytrack_last_transaction', JSON.stringify(lastValues));
        },
        loadLastTransactionValues() {
            // Charger les dernières valeurs depuis localStorage
            const saved = localStorage.getItem('moneytrack_last_transaction');
            if (saved) {
                try {
                    const lastValues = JSON.parse(saved);
                    if (lastValues.date) {
                        this.transactionForm.date = lastValues.date;
                    }
                    if (lastValues.type) {
                        this.transactionForm.type = lastValues.type;
                    }
                    if (lastValues.categorie) {
                        this.transactionForm.categorie = lastValues.categorie;
                    }
                } catch (e) {
                    console.error('Erreur lors du chargement des dernières valeurs:', e);
                }
            }
        },
        applyTransaction(transaction) {
            const compteSource = this.comptes.find(c => c.id === transaction.source);
            if (!compteSource) return;

            if (transaction.type === 'revenu') {
                compteSource.solde += transaction.montant;
            } else if (transaction.type === 'dépense') {
                compteSource.solde -= transaction.montant;
            } else if (transaction.type === 'transfert' && transaction.destination) {
                compteSource.solde -= transaction.montant;
                const compteDest = this.comptes.find(c => c.id === transaction.destination);
                if (compteDest) {
                    compteDest.solde += transaction.montant;
                }
            } else if (transaction.type === 'remboursement') {
                compteSource.solde += transaction.montant;
            }
        },
        revertTransaction(transaction) {
            const compteSource = this.comptes.find(c => c.id === transaction.source);
            if (!compteSource) return;

            if (transaction.type === 'revenu') {
                compteSource.solde -= transaction.montant;
            } else if (transaction.type === 'dépense') {
                compteSource.solde += transaction.montant;
            } else if (transaction.type === 'transfert' && transaction.destination) {
                compteSource.solde += transaction.montant;
                const compteDest = this.comptes.find(c => c.id === transaction.destination);
                if (compteDest) {
                    compteDest.solde -= transaction.montant;
                }
            } else if (transaction.type === 'remboursement') {
                compteSource.solde -= transaction.montant;
            }
        },
        editTransaction(transaction) {
            this.editingTransaction = transaction;
            this.transactionForm = { ...transaction };
            this.showAddTransactionModal = true;
        },
        deleteTransaction(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
                const transaction = this.transactions.find(t => t.id === id);
                if (transaction) {
                    this.revertTransaction(transaction);
                    this.transactions = this.transactions.filter(t => t.id !== id);
                    this.saveData();
                    this.filterTransactions();
                }
            }
        },
        handleTransactionModalOverlayMouseDown(event) {
            // Vérifier si le mousedown a eu lieu sur l'overlay (pas dans la modal)
            if (event.target === event.currentTarget) {
                this.modalClickStartedOnOverlay = true;
            } else {
                this.modalClickStartedOnOverlay = false;
            }
        },
        handleTransactionModalOverlayMouseUp(event) {
            // Ne pas fermer si une sélection de texte est en cours
            const selection = window.getSelection();
            const activeElement = document.activeElement;
            const hasTextSelection = selection && selection.toString().length > 0;
            const hasInputSelection = activeElement && 
                (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
                activeElement.selectionStart !== activeElement.selectionEnd;
            
            if (hasTextSelection || hasInputSelection) {
                this.modalClickStartedOnOverlay = false;
                return;
            }
            // Fermer seulement si le clic a commencé ET s'est terminé sur l'overlay
            if (this.modalClickStartedOnOverlay && event.target === event.currentTarget) {
                this.closeTransactionModal();
            }
            this.modalClickStartedOnOverlay = false;
        },
        closeTransactionModal() {
            this.showAddTransactionModal = false;
            this.editingTransaction = null;
            // Ne pas réinitialiser date, type et categorie - elles seront chargées depuis localStorage
            // lors de l'ouverture du prochain modal
            this.transactionForm = {
                date: new Date().toISOString().split('T')[0],
                montant: 0,
                type: 'dépense',
                source: 0,
                destination: 0,
                categorie: '',
                personne: 0,
                description: ''
            };
        },
        openTransactionModal() {
            // Réinitialiser le formulaire avec les valeurs par défaut
            this.transactionForm = {
                date: new Date().toISOString().split('T')[0],
                montant: 0,
                type: 'dépense',
                source: 0,
                destination: 0,
                categorie: '',
                personne: 0,
                description: ''
            };
            // Charger les dernières valeurs sauvegardées (date, type, categorie)
            this.loadLastTransactionValues();
            this.showAddTransactionModal = true;
        },
        updateTransactionForm() {
            if (this.transactionForm.type === 'transfert') {
                this.transactionForm.personne = 0;
            }
        },
        filterTransactions() {
            let filtered = [...this.transactions];
            
            if (this.filterCategorie) {
                filtered = filtered.filter(t => t.categorie === this.filterCategorie);
            }
            
            if (this.filterType) {
                filtered = filtered.filter(t => t.type === this.filterType);
            }
            
            if (this.filterMonth) {
                filtered = filtered.filter(t => t.date.startsWith(this.filterMonth));
            }
            
            this.filteredTransactions = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        // Gestion des personnes/dettes
        savePerson() {
            if (this.editingPerson) {
                const index = this.personnes.findIndex(p => p.id === this.editingPerson.id);
                if (index !== -1) {
                    this.personnes[index] = { ...this.personForm, id: this.editingPerson.id };
                }
            } else {
                const newId = this.personnes.length > 0 ? Math.max(...this.personnes.map(p => p.id)) + 1 : 1;
                this.personnes.push({ ...this.personForm, id: newId });
            }
            this.closePersonModal();
            this.saveData();
        },
        editPerson(personne) {
            this.editingPerson = personne;
            this.personForm = { ...personne };
            this.showAddPersonModal = true;
        },
        deletePerson(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
                this.personnes = this.personnes.filter(p => p.id !== id);
                this.transactions.forEach(t => {
                    if (t.personne === id) {
                        t.personne = 0;
                    }
                });
                this.saveData();
            }
        },
        handlePersonModalOverlayMouseDown(event) {
            // Vérifier si le mousedown a eu lieu sur l'overlay (pas dans la modal)
            if (event.target === event.currentTarget) {
                this.modalClickStartedOnOverlay = true;
            } else {
                this.modalClickStartedOnOverlay = false;
            }
        },
        handlePersonModalOverlayMouseUp(event) {
            // Ne pas fermer si une sélection de texte est en cours
            const selection = window.getSelection();
            const activeElement = document.activeElement;
            const hasTextSelection = selection && selection.toString().length > 0;
            const hasInputSelection = activeElement && 
                (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
                activeElement.selectionStart !== activeElement.selectionEnd;
            
            if (hasTextSelection || hasInputSelection) {
                this.modalClickStartedOnOverlay = false;
                return;
            }
            // Fermer seulement si le clic a commencé ET s'est terminé sur l'overlay
            if (this.modalClickStartedOnOverlay && event.target === event.currentTarget) {
                this.closePersonModal();
            }
            this.modalClickStartedOnOverlay = false;
        },
        closePersonModal() {
            this.showAddPersonModal = false;
            this.editingPerson = null;
            this.personForm = { nom: '' };
        },
        getPersonName(id) {
            const personne = this.personnes.find(p => p.id === id);
            return personne ? personne.nom : '-';
        },
        getDebtBalance(personId) {
            let balance = 0;
            this.transactions.forEach(t => {
                if (t.personne === personId) {
                    if (t.type === 'dépense') {
                        balance -= t.montant; // Tu as payé, elle te doit
                    } else if (t.type === 'remboursement') {
                        balance += t.montant; // Elle t'a remboursé
                    }
                }
            });
            return balance;
        },
        openAddDebtModal(transaction) {
            this.transactionForDebt = transaction;
            this.showAddDebtModal = true;
        },
        closeAddDebtModal() {
            this.showAddDebtModal = false;
            this.transactionForDebt = null;
        },
        handleDebtModalOverlayMouseDown(event) {
            if (event.target === event.currentTarget) {
                this.modalClickStartedOnOverlay = true;
            } else {
                this.modalClickStartedOnOverlay = false;
            }
        },
        handleDebtModalOverlayMouseUp(event) {
            const selection = window.getSelection();
            const activeElement = document.activeElement;
            const hasTextSelection = selection && selection.toString().length > 0;
            const hasInputSelection = activeElement && 
                (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
                activeElement.selectionStart !== activeElement.selectionEnd;
            
            if (hasTextSelection || hasInputSelection) {
                this.modalClickStartedOnOverlay = false;
                return;
            }
            if (this.modalClickStartedOnOverlay && event.target === event.currentTarget) {
                this.closeAddDebtModal();
            }
            this.modalClickStartedOnOverlay = false;
        },
        addDebtToTransaction(personId) {
            if (!this.transactionForDebt) return;
            
            const index = this.transactions.findIndex(t => t.id === this.transactionForDebt.id);
            if (index !== -1) {
                this.transactions[index].dettePersonne = personId;
                this.transactions[index].rembourse = false; // Initialiser à false
                // Sauvegarder la dernière personne sélectionnée
                this.lastDebtPerson = personId;
                localStorage.setItem('moneytrack_last_debt_person', personId.toString());
                this.saveData();
                this.filterTransactions();
            }
            this.closeAddDebtModal();
        },
        removeDebtFromTransaction(transaction) {
            const index = this.transactions.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                this.transactions[index].dettePersonne = null;
                this.transactions[index].rembourse = false;
                this.saveData();
                this.filterTransactions();
            }
        },
        setRembourse(transaction, value) {
            const index = this.transactions.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                this.transactions[index].rembourse = value;
                this.saveData();
                this.filterTransactions();
            }
        },
        toggleValidation(transaction) {
            const index = this.transactions.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                this.transactions[index].valide = !this.transactions[index].valide;
                // Ajouter un flag pour l'animation
                this.transactions[index]._justClicked = true;
                // Retirer le flag après l'animation
                setTimeout(() => {
                    if (this.transactions[index]) {
                        this.transactions[index]._justClicked = false;
                    }
                }, 600);
                this.saveData();
                this.filterTransactions();
            }
        },

        // Utilitaires
        formatCurrency(amount) {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount);
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        },

        // Sauvegarde/Chargement
        async saveData() {
            const data = {
                comptes: this.comptes,
                personnes: this.personnes,
                transactions: this.transactions
            };
            
            console.log('💾 Tentative de sauvegarde...', {
                comptes: data.comptes.length,
                personnes: data.personnes.length,
                transactions: data.transactions.length
            });
            
            // Sauvegarder UNIQUEMENT dans Firebase Realtime Database
            const db = typeof window !== 'undefined' ? window.database : (typeof database !== 'undefined' ? database : null);
            console.log('🔍 Vérification de database...', typeof db, db ? 'défini' : 'undefined');
            
            if (!db) {
                const errorMsg = '❌ Firebase n\'est pas disponible. Impossible de sauvegarder les données.';
                console.error(errorMsg);
                alert(errorMsg);
                throw new Error('Firebase non disponible');
            }
            
            try {
                console.log('📤 Envoi des données vers Firebase Realtime Database...');
                await db.ref('moneytrack').set(data);
                console.log('✅ Données sauvegardées dans Firebase Realtime Database');
            } catch (e) {
                console.error('❌ Erreur Firebase Realtime Database:', e);
                console.error('Détails de l\'erreur:', e.message, e.code);
                if (e.code === 'PERMISSION_DENIED' || e.code === 'permission_denied') {
                    alert('❌ Erreur de permission Firebase. Vérifiez que les règles de sécurité sont correctement configurées dans Firebase Console.');
                } else {
                    alert('❌ Erreur lors de la sauvegarde dans Firebase: ' + e.message);
                }
                throw e;
            }
        },
        async loadData() {
            console.log('📂 Chargement des données...');
            
            let dataLoaded = false;
            
            // Charger UNIQUEMENT depuis Firebase Realtime Database avec synchronisation en temps réel
            const db = typeof window !== 'undefined' ? window.database : (typeof database !== 'undefined' ? database : null);
            
            if (!db) {
                console.error('❌ Firebase n\'est pas disponible. Impossible de charger les données.');
                alert('❌ Firebase n\'est pas disponible. Vérifiez la configuration.');
                this.initializeDefaultData();
                return;
            }
            
            try {
                // Charger les données initiales depuis Firebase
                const snapshot = await db.ref('moneytrack').once('value');
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log('✅ Données chargées depuis Firebase Realtime Database:', {
                        comptes: data.comptes?.length || 0,
                        personnes: data.personnes?.length || 0,
                        transactions: data.transactions?.length || 0
                    });
                    this.processLoadedData(data);
                    dataLoaded = true;
                } else {
                    console.log('⚠️ Aucune donnée trouvée dans Firebase Realtime Database');
                    console.log('💡 Utilisez le bouton "📤 Importer JSON" pour charger vos données initiales dans Firebase');
                }
                
                // Écouter les changements en temps réel depuis Firebase
                db.ref('moneytrack').on('value', (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        console.log('🔄 Données mises à jour en temps réel depuis Firebase Realtime Database');
                        this.processLoadedData(data);
                    }
                });
            } catch (e) {
                console.error('❌ Erreur Firebase Realtime Database:', e);
                console.error('Détails:', e.message, e.code);
                if (e.code === 'PERMISSION_DENIED' || e.code === 'permission_denied') {
                    alert('❌ Erreur de permission Firebase. Vérifiez que les règles de sécurité sont correctement configurées dans Firebase Console.\n\nLes règles doivent permettre la lecture et l\'écriture sur /moneytrack');
                }
            }
            
            // Si aucune donnée n'a été trouvée, initialiser avec des données par défaut
            if (!dataLoaded) {
                console.log('⚠️ Aucune donnée trouvée, initialisation avec des données par défaut');
                this.initializeDefaultData();
            }
        },
        processLoadedData(data) {
            this.comptes = data.comptes || [];
            this.personnes = data.personnes || [];
            this.transactions = data.transactions || [];
            
            // Initialiser soldeInitial pour les comptes qui n'en ont pas (compatibilité)
            this.comptes.forEach(c => {
                if (c.soldeInitial === undefined) {
                    c.soldeInitial = c.solde;
                }
            });
            
            // Initialiser rembourse, valide et dettePersonne pour les transactions qui n'en ont pas (compatibilité)
            this.transactions.forEach(t => {
                if (t.rembourse === undefined) {
                    t.rembourse = false;
                }
                if (t.valide === undefined) {
                    t.valide = false;
                }
                if (t.dettePersonne === undefined) {
                    t.dettePersonne = null;
                }
            });
            
            // Charger la dernière personne sélectionnée pour les dettes
            const lastPersonId = localStorage.getItem('moneytrack_last_debt_person');
            if (lastPersonId) {
                this.lastDebtPerson = parseInt(lastPersonId);
            }
            
            // Recalculer les soldes des comptes à partir des transactions
            this.recalculateAccountBalances();
            this.filterTransactions();
        },
        recalculateAccountBalances() {
            // Stocker les soldes initiaux de chaque compte
            const initialBalances = {};
            this.comptes.forEach(c => {
                // Si le compte n'a pas de solde initial stocké, utiliser le solde actuel
                initialBalances[c.id] = c.soldeInitial !== undefined ? c.soldeInitial : c.solde;
            });

            // Réinitialiser tous les soldes aux soldes initiaux
            this.comptes.forEach(c => {
                c.solde = initialBalances[c.id] || 0;
            });

            // Réappliquer toutes les transactions dans l'ordre chronologique
            const sortedTransactions = [...this.transactions].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            sortedTransactions.forEach(t => {
                this.applyTransaction(t);
            });
        },
        initializeDefaultData() {
            // Initialiser avec une personne "Moi"
            this.personnes = [{ id: 1, nom: 'Moi' }];
            // Ne pas appeler saveData() ici pour éviter le téléchargement automatique
        },
        exportData() {
            const data = {
                comptes: this.comptes,
                personnes: this.personnes,
                transactions: this.transactions
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Ajouter la date au nom du fichier
            const date = new Date().toISOString().split('T')[0];
            a.download = `moneytrack_backup_${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        async importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.comptes = data.comptes || [];
                    this.personnes = data.personnes || [];
                    this.transactions = data.transactions || [];
                    
                    // Initialiser soldeInitial pour les comptes qui n'en ont pas (compatibilité)
                    this.comptes.forEach(c => {
                        if (c.soldeInitial === undefined) {
                            c.soldeInitial = c.solde;
                        }
                    });
                    
                    this.recalculateAccountBalances();
                    await this.saveData();
                    this.filterTransactions();
                    alert('Données importées avec succès !');
                } catch (error) {
                    alert('Erreur lors de l\'importation du fichier JSON');
                    console.error(error);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    }
}).mount('#app');

// Marquer que Vue est chargé pour cacher l'écran statique
setTimeout(() => {
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.classList.add('vue-loaded');
    }
}, 100);

// Gérer le formulaire statique de secours
(function() {
    function initStaticLogin() {
        const staticForm = document.getElementById('static-login-form');
        const staticPasswordInput = document.getElementById('static-password-input');
        const staticError = document.getElementById('static-password-error');
        const staticLogin = document.getElementById('static-login');
        
        if (!staticForm) {
            setTimeout(initStaticLogin, 100);
            return;
        }
        
        staticForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const password = staticPasswordInput.value;
            
            if (!password) {
                if (staticError) {
                    staticError.textContent = 'Veuillez entrer un mot de passe.';
                    staticError.style.display = 'block';
                }
                return;
            }
            
            // Vérifier directement avec Firebase
            try {
                const db = typeof window !== 'undefined' ? window.database : (typeof database !== 'undefined' ? database : null);
                if (!db) {
                    if (staticError) {
                        staticError.textContent = 'Firebase n\'est pas disponible. Veuillez attendre le chargement.';
                        staticError.style.display = 'block';
                    }
                    return;
                }
                
                const snapshot = await db.ref('password').once('value');
                const storedPassword = snapshot.val();
                
                if (password === storedPassword) {
                    // Authentification réussie
                    sessionStorage.setItem('moneytrack_authenticated', 'true');
                    
                    // Cacher l'écran statique
                    if (staticLogin) {
                        staticLogin.style.display = 'none';
                    }
                    
                    // Recharger la page pour que Vue prenne en compte l'authentification
                    window.location.reload();
                } else {
                    if (staticError) {
                        staticError.textContent = 'Mot de passe incorrect.';
                        staticError.style.display = 'block';
                    }
                    if (staticPasswordInput) {
                        staticPasswordInput.value = '';
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la vérification:', error);
                if (staticError) {
                    staticError.textContent = 'Erreur lors de la vérification. Veuillez réessayer.';
                    staticError.style.display = 'block';
                }
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStaticLogin);
    } else {
        initStaticLogin();
    }
})();

