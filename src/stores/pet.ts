import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet } from './types'
import { getAllPets, getPetById, createPet, updatePet, deletePet } from '../api/petsApi'
import { ElMessage } from 'element-plus'

export const usePetStore = defineStore('pet', () => {
  // 状态
  const pets = ref<Pet[]>([])
  const currentPet = ref<Pet | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // 计算属性
  const availablePets = computed(() => pets.value.filter(pet => pet.status === 'available'))
  const adoptedPets = computed(() => pets.value.filter(pet => pet.status === 'adopted'))
  const petsBySpecies = computed(() => {
    const grouped: Record<string, Pet[]> = {}
    pets.value.forEach(pet => {
      const species = pet.species || '未知种类'  // 处理可选字段
      if (!grouped[species]) {
        grouped[species] = []
      }
      grouped[species].push(pet)
    })
    return grouped
  })

  // 动作
  const fetchPets = async () => {
    loading.value = true
    try {
      const response = await getAllPets()
      pets.value = response.data
      total.value = response.data.length
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取宠物列表失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchPetById = async (id: number) => {
    loading.value = true
    try {
      const response = await getPetById(id)
      currentPet.value = response.data
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取宠物详情失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const addPet = async (petData: Omit<Pet, 'petId'>) => {
    loading.value = true
    try {
      const response = await createPet(petData)
      pets.value.unshift(response.data)
      total.value++
      ElMessage.success('宠物添加成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '添加宠物失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const editPet = async (petData: Pet) => {
    loading.value = true
    try {
      const response = await updatePet(petData)
      const index = pets.value.findIndex(pet => pet.petId === petData.petId)
      if (index !== -1) {
        pets.value[index] = response.data
      }
      if (currentPet.value?.petId === petData.petId) {
        currentPet.value = response.data
      }
      ElMessage.success('宠物信息更新成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '更新宠物信息失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const removePet = async (id: number) => {
    loading.value = true
    try {
      await deletePet(id)
      pets.value = pets.value.filter(pet => pet.petId !== id)
      total.value--
      if (currentPet.value?.petId === id) {
        currentPet.value = null
      }
      ElMessage.success('宠物删除成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除宠物失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    pets,
    currentPet,
    loading,
    total,
    // 计算属性
    availablePets,
    adoptedPets,
    petsBySpecies,
    // 动作
    fetchPets,
    fetchPetById,
    addPet,
    editPet,
    removePet
  }
})