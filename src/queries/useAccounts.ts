import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'


export function useAccounts(){
const qc = useQueryClient()


const list = useQuery({
queryKey: ['accounts'],
queryFn: async () => {
const { data, error } = await supabase.from('accounts').select('*').order('created_at',{ ascending:false })
if (error) throw error
return data as any[]
}
})


const create = useMutation({
mutationFn: async (payload:{name:string;type:'CASH'|'BANK'|'CARD'|'WALLET';currency?:string;opening_balance?:number}) => {
const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase.from('accounts').insert({
user_id: user!.id,
name: payload.name,
type: payload.type,
currency: payload.currency ?? 'EUR',
opening_balance: payload.opening_balance ?? 0
}).select().single()
if (error) throw error
return data
},
onSuccess: () => qc.invalidateQueries({ queryKey:['accounts'] })
})


const remove = useMutation({
mutationFn: async (id:string) => {
const { error } = await supabase.from('accounts').delete().eq('id', id)
if (error) throw error
},
onSuccess: () => qc.invalidateQueries({ queryKey:['accounts'] })
})


return { list, create, remove }
}