import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer>
                <Drawer.Screen name="index" options={{
                    title: "Área Logada", drawerIcon: ({ color }) => (
                        <FontAwesome name="user" size={24} color={color} />
                    ),
                }} />

                <Drawer.Screen name="produtos/index" options={{
                    title: "Produtos",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="amazon" size={24} color={color} />
                    ),
                }} />

                <Drawer.Screen name="newProduto/index" options={{
                    title: "Novo Produto",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="amazon" size={24} color={color} />
                    ),
                }} />

                <Drawer.Screen name="updateProduto/index" options={{  
                    title: "Atualizar Produto",
                    drawerItemStyle: { display: 'none' },
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="amazon" size={24} color={color} />
                ),      
                }} />

                <Drawer.Screen name="cliente/index"  options={{
                    title: "Clientes",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="users" size={24} color={color} />
                    ),
                }} />

                 <Drawer.Screen name="newCliente/index" options={{
                    title: "Novo Clientes",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="users" size={24} color={color} />
                    ),
                }} />

                <Drawer.Screen name="venda/index" options={{
                    title: "Vendas",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="shopping-bag" size={24} color={color} />
                    ),
                }} />
                
                <Drawer.Screen name="newVenda/index" options={{
                    title: "Nova Venda",
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="shopping-bag" size={24} color={color} />
                    ),
                }} />



                 <Drawer.Screen name="updateClient/index" options={{
                    title: "Atualizar Clientes",
                    drawerItemStyle: { display: 'none' },
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="users" size={24} color={color} />
                    ),
                }} />

                <Drawer.Screen name="updateVenda/index" options={{
                    title: "Atualizar venda",
                    drawerItemStyle: { display: 'none' },
                    drawerIcon: ({ color }) => (
                        <FontAwesome name="users" size={24} color={color} />
                    ),
                }} />

            </Drawer>

        </GestureHandlerRootView>

    )
}