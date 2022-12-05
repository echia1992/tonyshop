<template>
  <v-main>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
            src="/img/logo.png"
            class="my-3"
            contain
            height="70"
        />
      </v-col>
      <v-col class="px-12 px-md-0 " cols="12" md="6" lg="4" offset-md="3" offset-lg="4">
        <v-text-field
            label="Username"
            outlined
            v-model="username"
        ></v-text-field>
        <v-text-field
            label="Password"
            outlined
            v-model="password"
        ></v-text-field>
        <v-btn :loading="loginLoading" @click="login()" color="primary" large>Login</v-btn>
      </v-col>
    </v-row>
    <v-dialog
        v-model="dialog"
        width="500"
    >
      <v-card class="pa-5">

        <v-card-text>
          {{dialogText}}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="dialog =false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        centered
        :timeout="2000"
    >{{ snackbarText }}</v-snackbar>
  </v-main>
</template>
<script>
export default {
  name: "Login",
  watch:{

  },
  data:()=>({
      dialog: false,
      dialogText: '',
      username:'',
      password: '',
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
      loginLoading: false,
    }),
  methods:{
    login(){
      this.loginLoading= true;
      fetch(this.$store.state.baseUrl+'auth',{
          method: 'POST',
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
      }).then(response =>{
        return response.json();
      }).then(data =>{
          this.loginLoading = false;
          if (data.status === 200){
           this.$store.commit('setAuth',{
             token: data.token,
             user: data.user,
             permissions: data.permissions
           });
           this.$cookies.set('jwt_token', data.token);
          this.$router.push('/')
          }else {
            this.snackbar = true
            this.snackbarText = data.message
            this.snackbarColor = data.status === 200 ? 'green' : 'red';
          }
      }).catch(err =>{
        this.snackbar = true
        this.snackbarText = err.message
      });
    },
      setSnackBar(data) {
        this.snackbar = true;
        this.snackbarText = data.message;
        this.snackbarColor = data.status === 200 ? 'green' : 'red';
      }
  }
}
</script>

<style scoped>

</style>