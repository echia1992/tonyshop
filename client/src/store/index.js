import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    baseUrl: "http://localhost:5000/",
    jwt_token: "",
    user: {},
    permissions: [],
    menus: [
      {
        name: "Home",
        link: "/"
      },
      {
        name: "About",
        link: "/about"
      },
      {
        name: "Cart",
        link: "/cart",
        logInRequired: true
      },
      {
        name: "Orders",
        link: "/orders",
        logInRequired: true
      },
      {
        name: "Login",
        link: "/login",
        logInRequired: false
      },
      {
        name: "Sign Up",
        link: "/signup",
        logInRequired: false
      },
      {
        name: "Admin",
        logInRequired: true,
        children: [
          {
            name: "Category",
            link: "/category",
            permissionRequired: ['access-all']
          },
          {
            name: "User",
            link: "/users",
            permissionRequired: ['access-all']
          },
          {
            name: "Variant",
            link: "/variant",
            permissionRequired: ['access-all']
          },
          {
            name: "Product",
            link: "/product",
            permissionRequired: ['access-all','create:products','edit:products','delete:products']
          }
        ]
      },

    ],

  },
  getters: {
  },
  mutations: {
    setAuth: (state, payload)=>{
      state.jwt_token = payload.token;
      state.user = payload.user;
      state.permissions = payload.permissions
    }
  },
  actions: {
    asyncUpdateCount: ({ commit, state }, payload)=> {
      setTimeout(() => {
        commit('updateCount', payload);
      }, 3000);
    }
    },
  modules: {
  }
})
