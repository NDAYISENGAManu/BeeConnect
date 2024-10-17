import { api } from ".";

interface UserUpload{
    serviceId:string, 
    file:string
    businessType: number
}

export const userUpload=async(payload:UserUpload)=>{  
    try {
        const { data } = await api.post('/api/v1/user/upload', payload)
        if (data.status) {
            return true;
        }
        return false; 
    } catch (error) {
        return false
    } 
}

export const getOrganizationById = async(orgId:any)=>{
    try {
        const { data } = await api.get(`/api/v1/organization/id/${orgId}`)
        if (data.status == 200) {
            return data
        }
        return {}
    } catch (error) {
        return {}
    }    
}

export const mapLocations = async()=>{
    try {
        const { data } = await api.get('/api/v1/geomap/upper');
        if (data.status == 200) {
            return data.data
        }
        return []
    } catch (error) {
        return []
    }
}

export const getOrganizations =async()=>{
    try {
        const {data} = await api.get('/api/v1/organization');
        if (data.status ==200) {
            return data
        }
        return []
    } catch (error) {
        return []
    }
}
