<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="12" sm="8" md="6" offset-sm="2" offset-md="3">
          <h3 class="mt-10 pa-5">Variant</h3>
          <div class="text-right mb-4">
            <v-btn color="primary" @click="variantDialog = true">
              Create New
            </v-btn>
          </div>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  Name
                </th>
                <th class="text-center">
                  Last Updated
                </th>
                <th class="text-right">
                  Action
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="item in variants"
                  :key="item.id"
              >
                <td class="pa-3">{{ item.name }}</td>
                <td class="pa-3">
                  {{item.updatedAt}}
                </td>
                <td class="text-right pa-3">
                  <v-btn fab color="orange" @click="openEditDialog(item.slug, item.name)">
                    <v-icon>mdi-square-edit-outline</v-icon>
                  </v-btn>
                  <v-btn class="ml-4" fab color="red" @click="deleteVariant(item.slug)">
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
        v-model="VariantDialog"
        width="500"
    >
      <v-card :loading="newVariantloading" :disabled="newVariantloading">
        <v-card-title class="text-h5">
          Create New Variant
        </v-card-title>
        <v-text-field
            label="Name"
            outlined
            v-model="newVariantName"
            class="mx-5"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="VariantDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="createVariant"

          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
        v-model="editVariantDialog"
        width="500"
    >
      <v-card :loading="editVariantloading" :disabled="editVariantloading">
        <v-card-title class="text-h5">
          Edit Variant
        </v-card-title>
        <v-text-field
            label="Name"
            outlined
            v-model="VariantToBeEdited"
            class="mx-5"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="editVariantDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="editVariant"
          >
            Update
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
    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        centered
        :timeout="2000"
    >{{snackbarText}}
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "Variant",
  created(){
    this.getVariant();
  },
  data: ()=>({
    newVariantloading: false,
    dialog: false,
    dialogText: '',
    snackbar:false,
    snackbarText:'',
    snackbarColor:'success',
    VariantDialog: false,
    newVariantName: "",
    variants: [],
    editVariantDialog: false,
    editVariantloading: false,
    variantToBeEdited: "",
    variantSlugToBeEdited: '',
    deleteVariantLoading: false
  }),
  methods:{
    createVariant(){
      this.newVariantloading = true;
      fetch(this.$store.state.baseUrl+'product/variant/',{
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          name: this.newVariantName
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 201){
          this.newVariantName = '';
          this.VariantDialog = false;
          this.getVariant();
        }
        this.dialog = true;
        this.dialogText = data.message;
        this.newVariantloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
        this.newVariantloading = false;
      });
    },
    editVariant(){
      this.editVariantloading = true;
      fetch(this.$store.state.baseUrl+'variant'+this.VariantSlugToBeEdited,{
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          name: this.VariantToBeEdited
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.VariantToBeEdited = '';
          this.editVariantDialog = false;
          this.getVariant();
        }
        this.dialog = true;
        this.dialogText = data.message;
        this.editVariantloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
        this.editVariantloading = false;
      });
    },
    deleteVariant(slug){
      if(!confirm('Are you sure you want to delete this Variant?')){
        return;
      }
      this.deleteVariantLoading = true;
      fetch(this.$store.state.baseUrl+'Variant/'+slug,{
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        this.deleteVariantLoading = false;
        if(data.status === 200){
          this.getVariant();
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
        this.dialog = true;
        this.dialogText = data.message;
      }).catch(err=>{
        this.deleteVariantLoading = false;
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    getVariant(){
      fetch(this.$store.state.baseUrl+'variant',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.variants = data.variant
        }else{
          this.dialog = true;
          this.dialogText = data.message;
          this.newVariantloading = false;
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
        this.newVariantloading = false;
      });
    },
    openEditDialog(slug, name){
      this.variantSlugToBeEdited = slug;
      this.variantToBeEdited = name;
      this.editVariantDialog = true;
    }
  }
}
</script>

<style scoped>

</style>
