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

          if (validatedData.data.existingMedia) {
            try {
              const existingMediaIds = JSON.parse(validatedData.data.existingMedia)
      
              if (Array.isArray(existingMediaIds) && existingMediaIds.length > 0) {
                // Delete any media that's not in the existingMediaIds list
                const { error: deleteError } = await supabase
                  .from("farm_media")
                  .delete()
                  .eq("farm_id", farmId)
                  .not("id", "in", `(${existingMediaIds.join(",")})`)
      
                if (deleteError) {
                  console.error("Error pruning media entries:", deleteError)
                }
              } else {
                // If no existing media was sent, delete all media for this farm
                const { error: deleteAllError } = await supabase.from("farm_media").delete().eq("farm_id", farmId)
      
                if (deleteAllError) {
                  console.error("Error deleting all media entries:", deleteAllError)
                }
              }
            } catch (existingMediaError) {
              console.error("Error handling existing media:", existingMediaError)
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
