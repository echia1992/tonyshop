<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="12" sm="10" md="8" offset-sm="1" offset-md="2">
          <h3 class="mt-10 pa-5">Orders</h3>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th>
                  Order No
                </th>
                <th>
                  Status
                </th>
                <th>
                  Amount
                </th>
                <th>
                  Created at
                </th>
                <th class="text-right">
                  Action
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="item in orders"
                  :key="item.id"
              >
                <td class="pa-3">{{ item.ref }}</td>
                <td class="pa-3">{{item.status.text.split('').map((a,i)=>i === 0?a.toUpperCase():a).join('')}}</td>
                <td class="pa-3">N{{ item.amount.toLocaleString("en-GB") }}</td>
                <td class="pa-3">
                  {{item.createdAt}}
                </td>
                <td class="text-right pa-3">
                  <v-btn fab color="orange" @click="$router.push('/order/'+item.ref)">
                    <v-icon>mdi-square-edit-outline</v-icon>
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
  name: "Order",
  created(){
    this.getOrders();
  },
  data: ()=>({
    dialog: '',
    dialogText: '',
    orders: [],
  }),
  methods: {
    getOrders(){
      fetch(this.$store.state.baseUrl+'orders',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.orders = data.orders
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
  }
}
</script>

<style scoped>

</style>