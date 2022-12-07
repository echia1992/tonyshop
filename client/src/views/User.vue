<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="12" sm="8" md="6" offset-sm="2" offset-md="3">
          <h3 class="mt-10 pa-5">User</h3>
          <div class="text-right mb-4">
            <v-btn color="primary" @click="userDialog = true">
              Create New
            </v-btn>
          </div>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  username
                </th>
                <th class="text-center">
                  email
                </th>
                <th class="text-right">
                  Action
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="item in users"
                  :key="item.id"
              >
                <td class="pa-3">{{ item.username }}</td>
                <td class="pa-3">{{ item.email }}</td>
                <td class="pa-3">{{ item.role }}</td>
                <td class="pa-3">
                  {{item.updatedAt}}
                </td>
                <td class="text-right pa-3">
                  <v-btn fab color="orange" @click="openEditDialog(item.slug, item.email)">
                    <v-icon>mdi-square-edit-outline</v-icon>
                  </v-btn>
                  <v-btn class="ml-4" fab color="red" @click="deleteUser(item.slug)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-main>
    <v-dialog
        v-model="userDialog"
        width="500"
    >
      <v-card :loading="newUserloading" :disabled="newUserloading">
        <v-card-title class="text-h5">
          Create New user
        </v-card-title>
        <v-text-field
            label="email"
            outlined
            v-model="newUser.email"
            class="mx-5"
        ></v-text-field>
        <v-text-field
            label="username"
            outlined
            v-model="newUser.username"
            class="mx-5"
        ></v-text-field>
        <v-text-field
            label="password"
            type="password"
            outlined
            v-model="newUser.password"
            class="mx-5"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="userDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="createUser"

          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
        v-model="dialog"
        width="500"
    >
      <v-card class="pa-5">

        <v-card-text>
          {{ dialogText }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="dialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "Users",
  created() {
   this.getUsers();
  },
  data:()=>({
    dialog:false,
    dialogText:'',
    userDialog:false,
    newUserloading:false,
    users:[],
    newUser: {
      email: '',
      username: '',
      imageUrl: '',
      role: '',
      gender: ''
    },
  }),
  methods: {
    getUsers(){
      fetch(this.$store.state.baseUrl+'users',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.users = data.users
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
      createUser(){
        this.createLoading = true;
        fetch(this.$store.state.baseUrl+"auth",{
          method: "PUT",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password,
            gender: this.gender,
            userRole: this.role
          })
        }).then(response=>{
          return response.json();
        }).then(data=>{
          this.createLoading = false;
          this.dialogText = data.message;
          this.dialog = true;
        }).catch(err=>{
          this.dialogText = err.message;
          this.dialog = true;
        });
      },
    },
    openEditDialog(slug, name){
      this.userSlugToBeEdited = slug;
      this.userToBeEdited = name;
      this.editUserDialog = true;
    }
}
</script>

<style scoped>

</style>