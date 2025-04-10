"use server"

import { createClient } from "@/utils/supabase/server"
import { FarmFormSchema, FarmFormState} from "./farm-schema"
import { revalidatePath } from "next/cache"

export async function createFarmAction(prevState: FarmFormState, formData: FormData): Promise<FarmFormState>{

  const supabase = await createClient()

  try {
    const {data: {user}, error: userError} = await supabase.auth.getUser()

    if (!user || userError) {
        return {
            success: false,
            message: "Authentication error"
        }
    }

    const {data:profile} = await supabase.from("profiles").select("id, role").eq("id", user.id).single()
    
    if(profile?.role !== "seller"){
        return {
          success: false,
          message: "Seller priviledge required"
        }
    }

    const rawFormData = Object.fromEntries(formData.entries())

    const formDataObject: any = {...rawFormData}

    if (formDataObject.establishedDate) {
        formDataObject.establishedDate = new Date(formDataObject.establishedDate)
    }

    const booleanFields = ["hasProcessingFacility", "pickupAvailable", "wholesaleAvailable"]
        booleanFields.forEach((field) => {
        formDataObject[field] = formDataObject[field] === "on" || formDataObject[field] === "true"
    })

    const arrayFields = ["farmType", "certifications", "breeds", "housingTypes", "deliveryOptions", "paymentMethods"]
        arrayFields.forEach((field) => {
            if (formDataObject[field] && typeof formDataObject[field] === "string") {
                try {
                        formDataObject[field] = JSON.parse(formDataObject[field])
                } catch (e) {
                    formDataObject[field] = []
                }
            }
     })

     const validatedData = FarmFormSchema.safeParse(formDataObject)
     
       if(!validatedData.success){
         return {
           success:false,
           errors: validatedData.error.flatten().fieldErrors,
           message: "Form valiation failed, please check the fields and try again."
         }
       }

       const farmData = {
          seller_id: user.id,
          name: validatedData.data.name,
          description: validatedData.data.description,
          established_date: validatedData.data.establishedDate ? validatedData.data.establishedDate.toISOString().split("T")[0] : null,
          size: validatedData.data.size,
          address: validatedData.data.address,
          city: validatedData.data.city,
          state: validatedData.data.state,
          postal_code: validatedData.data.postalCode,
          country: validatedData.data.country,

          // Add the new location fields
          latitude: validatedData.data.latitude,
          longitude: validatedData.data.longitude,
          formatted_address: validatedData.data.formattedAddress,
          place_id: validatedData.data.placeId,
          contact_name: validatedData.data.contactName,
          contact_email: validatedData.data.contactEmail,
          contact_phone: validatedData.data.contactPhone,
          website: validatedData.data.website,
          farm_type: validatedData.data.farmType,
          certifications: validatedData.data.certifications,
          production_capacity: validatedData.data.productionCapacity,
          breeds: validatedData.data.breeds,
          farming_practices: validatedData.data.farmingPractices,
          housing_types: validatedData.data.housingTypes,
          has_processing_facility: validatedData.data.hasProcessingFacility,
          processing_details: validatedData.data.processingDetails,
          storage_capabilities: validatedData.data.storageCapabilities,
          biosecurity_measures: validatedData.data.biosecurityMeasures,
          business_hours: validatedData.data.businessHours,
          delivery_options: validatedData.data.deliveryOptions,
          delivery_details: validatedData.data.deliveryDetails,
          pickup_available: validatedData.data.pickupAvailable,
          pickup_details: validatedData.data.pickupDetails,
          payment_methods: validatedData.data.paymentMethods,
          wholesale_available: validatedData.data.wholesaleAvailable,
          wholesale_details: validatedData.data.wholesaleDetails,
       }

       const {data, error} = await supabase.from("farms").insert(farmData).select()



       if (error) {
        console.error("Error inserting product:", error)
        return {
          message: `Database error: ${error.message}`,
          success: false,
        }
      }


      const  farmId = data[0].id

      if (validatedData.data.uploadedMedia) {
        try {
            const uploadedMedia = JSON.parse(validatedData.data.uploadedMedia)
            console.log("Parsed uploaded media:", uploadedMedia)
          // Save media entries to database
          if (uploadedMedia && Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
            console.log(`Inserting ${uploadedMedia.length} media entries for farm ${farmId}`)
  
            const mediaEntries = uploadedMedia.map((media: any) => ({
              farm_id: farmId,
              url: media.url,
              type: media.type,
              
            }))
  
            // Insert each media entry individually to avoid batch issues
            for (const entry of mediaEntries) {
              const { error: mediaError } = await supabase.from("farm_media").insert([entry])
  
              if (mediaError) {
                console.error("Error saving media entry:", mediaError, entry)
              }
            }
          }
        } catch (uploadError) {
          console.error("Error handling media uploads:", uploadError)
          // We don't fail the whole operation if media upload fails
          // Just log the error and continue
        }
      }
    revalidatePath("/vendor-marketplace/products")
    
    return {
        success:true,
        message: "Farm created successfully"
    }

} catch (error) {
    console.error("Error creating product:", error)
    return {
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    }
  }
  }


 

 export async function updateFarmAction(prevState: FarmFormState, formData: FormData): Promise<FarmFormState>{

  const supabase = await createClient()

  try {
    const {data:{user}} = await supabase.auth.getUser()

    if(!user){
      return {
        message: "You must be logged in to update a your farm",
        success: false,
      }
    }

    const farmId = formData.get("id") as string

    if (!farmId){
        return {
          message: "Farm Id is required for updates",
          success: false
        }
    }

    const {data:fetchFarm, error: fetchError} = await supabase.from("farms").select("seller_id").eq("id", farmId).single()

    if (fetchFarm?.seller_id !== user.id) {
        return {
          message: "You can only update your own farms",
          success: false,
        }
      }

      const rawFormData = Object.fromEntries(formData.entries())

      const formDataObject: any = { ...rawFormData }

      if (formDataObject.establishedDate) {
        formDataObject.establishedDate = new Date(formDataObject.establishedDate)
      }

      const booleanFields = ["hasProcessingFacility", "pickupAvailable", "wholesaleAvailable"]
        booleanFields.forEach((field) => {
            formDataObject[field] = formDataObject[field] === "on" || formDataObject[field] === "true"
        }
        )

        const arrayFields = ["farmType", "certifications", "breeds", "housingTypes", "deliveryOptions", "paymentMethods"]
            arrayFields.forEach((field) => {
                if (formDataObject[field] && typeof formDataObject[field] === "string") {
                try {
                    formDataObject[field] = JSON.parse(formDataObject[field])
                } catch (e) {
                    formDataObject[field] = []
                }
            }
        })


        const validatedData = FarmFormSchema.safeParse(formDataObject)

        if(!validatedData.success){
          console.error("Validation failed:", validatedData.error.flatten().fieldErrors)
            return {
              success:false,
              errors: validatedData.error.flatten().fieldErrors,
              message: "Form valiation failed, please check the fields and try again."
            }
        }

        const farmData = {

              seller_id: user.id,
              name: validatedData.data.name,
              description: validatedData.data.description,
              established_date: validatedData.data.establishedDate ? validatedData.data.establishedDate.toISOString().split("T")[0] : null,
              size: validatedData.data.size,
              address: validatedData.data.address,
              city: validatedData.data.city,
              state: validatedData.data.state,
              postal_code: validatedData.data.postalCode,
              country: validatedData.data.country,
    
              // Add the new location fields
              latitude: validatedData.data.latitude,
              longitude: validatedData.data.longitude,
              formatted_address: validatedData.data.formattedAddress,
              place_id: validatedData.data.placeId,
              contact_name: validatedData.data.contactName,
              contact_email: validatedData.data.contactEmail,
              contact_phone: validatedData.data.contactPhone,
              website: validatedData.data.website,
              farm_type: validatedData.data.farmType,
              certifications: validatedData.data.certifications,
              production_capacity: validatedData.data.productionCapacity,
              breeds: validatedData.data.breeds,
              farming_practices: validatedData.data.farmingPractices,
              housing_types: validatedData.data.housingTypes,
              has_processing_facility: validatedData.data.hasProcessingFacility,
              processing_details: validatedData.data.processingDetails,
              storage_capabilities: validatedData.data.storageCapabilities,
              biosecurity_measures: validatedData.data.biosecurityMeasures,
              business_hours: validatedData.data.businessHours,
              delivery_options: validatedData.data.deliveryOptions,
              delivery_details: validatedData.data.deliveryDetails,
              pickup_available: validatedData.data.pickupAvailable,
              pickup_details: validatedData.data.pickupDetails,
              payment_methods: validatedData.data.paymentMethods,
              wholesale_available: validatedData.data.wholesaleAvailable,
              wholesale_details: validatedData.data.wholesaleDetails,
        }

           const {data, error} = await supabase.from("farms").update(farmData).eq("id", farmId)

           if (error) {
            console.error("Error inserting product:", error)
            return {
              message: `Database error: ${error.message}`,
              success: false,
            }
          }

          if (validatedData.data.uploadedMedia) {
            try {
              const uploadedMedia = JSON.parse(validatedData.data.uploadedMedia)
              console.log("Update: Parsed uploaded media:", uploadedMedia)
              // Save media entries to database
              if (uploadedMedia && Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
                console.log(`Updating: Inserting ${uploadedMedia.length} media entries for farm ${farmId}`)
      
                const mediaEntries = uploadedMedia.map((media: any) => ({
                  farm_id: farmId,
                  url: media.url,
                  type: media.type,
                  
                }))
      
                // Insert each media entry individually to avoid batch issues
                for (const entry of mediaEntries) {
                  const { error: mediaError } = await supabase.from("farm_media").insert([entry])
      
                  if (mediaError) {
                    console.error("Error saving media entry:", mediaError, entry)
                  }
                }
              }
            } catch (uploadError) {
              console.error("Error handling media uploads:", uploadError)
            }
          }

          

          revalidatePath("/vendor-marketplace/settings")
            revalidatePath(`/vendor-marketplace/${farmId}`)


            return {
                message: "farm updated successfully!",
                success: true,
                farmId,
              }
    
  } catch (error) {

    console.error("Error updating farm:", error)
    return {
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    }
    
  }

 }


 export async function deleteFarmAction(farmId: string) {
   const supabase = await createClient()
   
   try {
     const {
       data: { user },
       error: userError
     } = await supabase.auth.getUser()
 
     if (!user) {
       return {
         success: false,
         message: 'You must be logged in to delete a farm'
       }
     }
 
     const { data: sellerFarm, error: sellerFarmError } =
       await supabase
         .from('farms')
         .select('seller_id')
         .eq('id', farmId)
         .single()

     if (sellerFarmError) {
       return {
         success: false,
         message: `Error fetching product: ${sellerFarmError.message}`
       }
     }
 
     if (sellerFarm.seller_id !== user.id) {
       return {
         success: false,
         message: 'You can only delete your own farm'
       }
     }
 
     // Get all associated media files
     const { data: mediaItems, error: mediaError } = await supabase
       .from('farm_media')
       .select('*')
       .eq('farm_id', farmId)
 
     if (mediaError) {
       return {
         success: false,
         message: `Error fetching farm: ${mediaError}`
       }
     }
 
     // Delete accompanying media
     if (mediaItems && mediaItems.length > 0) {
       const filePaths = mediaItems
         .map(item => {
           const url = item.url
 
           const pathMatch = url.match(/farm-media\/(.+)$/)
           return pathMatch ? pathMatch[1] : null
         })
         .filter((path): path is string => path !== null)
 
       if (filePaths.length > 0) {
         const { error: storageError } = await supabase.storage
           .from('farm-media')
           .remove(filePaths)
 
         if (storageError) {
           console.error(
             'Error deleting media files from storage:',
             storageError
           )
         }
       }
 
       const { error: deleteMediaError } = await supabase
         .from('farm_media')
         .delete()
         .eq('farm_id', farmId)
 
       if (deleteMediaError) {
         console.error('Error deleting media records:', deleteMediaError)
       }
     }
 
     const { error: deleteError } = await supabase
       .from('farms')
       .delete()
       .eq('id', farmId)
 
     if (deleteError) {
       return {
         success: false,
         message: `Error deleting farm: ${deleteError.message}`
       }
     }
 
     revalidatePath('/vendor-marketplace/settings')
 
     return {
       success: true,
       message: 'Farm deleted successfully.'
     }
   } catch (error) {
     console.error('Error deleting farm:', error)
     return {
       success: false,
       message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
     }
   }
 }


export async function deleteFarmMediaAction(mediaId: string) {

  const supabase = await createClient()
  const {data: {user}, error: userError} = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, message: "You must be logged in to delete media" }
  }

  try {
    // First check if the media belongs to the current user's farm
    const { data: media, error: fetchMediaError } = await supabase
      .from("farm_media")
      .select("farm_id, url")
      .eq("id", mediaId)
      .single()

    if (fetchMediaError) {
      return { success: false, message: `Error fetching media: ${fetchMediaError.message}` }
    }

    // Check if the farm belongs to the current user
    const { data: farm, error: fetchFarmError } = await supabase
      .from("farms")
      .select("seller_id")
      .eq("id", media.farm_id)
      .single()

    if (fetchFarmError) {
      return { success: false, message: `Error fetching farm: ${fetchFarmError.message}` }
    }

    if (farm.seller_id !== user.id) {
      return { success: false, message: "You can only delete media for your own farms" }
    }

    // Extract the path from the URL
    const url = media.url
    const pathMatch = url.match(/farm-media\/(.+)$/)
    const path = pathMatch ? pathMatch[1] : null

    if (path) {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from("farm-media").remove([path])

      if (storageError) {
        console.error("Error deleting from storage:", storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase.from("farm_media").delete().eq("id", mediaId)

    if (dbError) {
      return { success: false, message: `Error deleting media: ${dbError.message}` }
    }

    revalidatePath(`/vendor-marketplace/settings`)
    return { success: true, message: "Media deleted successfully" }
  } catch (error) {
    console.error("Error deleting media:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
