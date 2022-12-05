<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">
        <v-img
            alt="Vuetify Logo"
            class="shrink mr-2"
            contain
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
            transition="scale-transition"
            width="40"
        />

        <v-img
            alt=""
            class="shrink mt-1 hidden-sm-and-down"
            contain
            min-width="100"
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
            width="100"
        />
      </div>

      <v-spacer></v-spacer>
      <div class="hidden-sm-and-down">
        <template v-for="(menu,i) in $store.state.menus">
          <v-menu offset-y v-if="(!menu.logInRequired && $store.state.jwt_token === '')||(menu.logInRequired && $store.state.jwt_token !== '')||(typeof menu.logInRequired === 'undefined')" :key="i">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="white"
                  dark
                  text
                  v-bind="attrs"
                  v-on="on"
                  :to="menu.link"
              >
                {{menu.name}}
              </v-btn>
            </template>
            <v-list v-if="typeof menu.children !== 'undefined'">
              <template v-for="(item, j) in menu.children">
                <v-list-item
                    v-if="formatMenu(i,j)"
                    :key="j"
                    style="cursor: pointer;"
                >
                  <router-link tag="div" :to="item.link">
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                  </router-link>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </template>
        <v-btn
            v-if="$store.state.jwt_token !== ''"
            color="white"
            dark
            text @click="logout()">Logout</v-btn>
      </div>
    </v-app-bar>
    <v-main>

      <div>

        <v-switch
            v-model="$vuetify.theme.dark"
            inset
            label="Change theme"
            color="green"
            class="mt-4 ml-3"
        ></v-switch >
      </div>
      <VSpacer></VSpacer>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
  created(){
    this.$vuetify.theme.dark = false;
    if(this.$cookies.isKey('jwt_token')){
      this.$store.commit('setAuth',{
        token: this.$cookies.get('jwt_token'),
        user: {},
        permissions: [],
      });
    }
    if(this.$store.state.jwt_token !== ''){
      fetch(this.$store.state.baseUrl+'auth',{
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.$store.commit('setAuth',{
            token: this.$cookies.get('jwt_token'),
            user: data.user,
            permissions: data.permissions
          });
        }else{
          this.logout();
        }
      });
    }
  },
  methods:{
    logout(){
      this.$cookies.remove('jwt_token');
      this.$store.commit('setAuth',{
        token: "",
        user: {}
      });
      this.$router.push('/login');
    },
    formatMenu(parent,child){
      let result = this.$store.state.permissions.find(p=>{
        return this.$store.state.menus[parent].children[child].permissionRequired.includes(p);
      });
      return result != null;
    }
  }
};
</script>
<style>
</style>