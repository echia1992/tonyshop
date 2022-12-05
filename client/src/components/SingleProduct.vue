<template>
  <v-card
      class="mx-auto"
      max-width="350"
      outlined
  >
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="text-h5 mb-1">
          {{item.title}}
        </v-list-item-title>
        <v-list-item-subtitle>{{item.description.substring(0,30)}}</v-list-item-subtitle>
        <h4 class="mt-3">N{{item.price.toLocaleString('en-GB')}}</h4>
      </v-list-item-content>

      <v-list-item-avatar
          tile
          size="80"
          color="grey"
      >
        <v-img :src="item.imageUrl"></v-img>
      </v-list-item-avatar>
    </v-list-item>

    <v-card-actions>
      <v-btn
          outlined
          rounded
          text
          color="yellow"
          @click="addToCart"
      >
        Add to Cart
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
name: "SingleProduct",
  props:{
  item:{
    type: Object,
    required: true
  }
  },
  methods:{
    addToCart(){
      fetch(this.$store.state.baseUrl+'product/'+this.item.slug+'/cart',{
        method: 'PUT',
        headers: {
          Authorization: this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        this.$emit('addToCartEmitted',data);
      }).catch(err=>{
        this.$emit('addToCartEmitted',err);
      });
    }
  }
}
</script>

<style scoped>

</style>